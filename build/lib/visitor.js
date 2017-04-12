"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = require("odata-v4-parser/lib/lexer");
const odata_v4_literal_1 = require("odata-v4-literal");
const qs = require("qs");
class ResourcePathVisitor {
    constructor() {
        this.includes = {};
        this.navigation = [];
        this.path = "";
        this.alias = {};
    }
    Visit(node, context) {
        this.ast = this.ast || node;
        context = context || {};
        if (node) {
            let visitor;
            switch (node.type) {
                case "PrimitiveFunctionImportCall":
                case "PrimitiveCollectionFunctionImportCall":
                case "ComplexFunctionImportCall":
                case "ComplexCollectionFunctionImportCall":
                case "EntityFunctionImportCall":
                case "EntityCollectionFunctionImportCall":
                    visitor = this.VisitFunctionImportCall;
                    break;
                case "BoundPrimitiveFunctionCall":
                case "BoundPrimitiveCollectionFunctionCall":
                case "BoundComplexFunctionCall":
                case "BoundComplexCollectionFunctionCall":
                case "BoundEntityFunctionCall":
                case "BoundEntityCollectionFunctionCall":
                    visitor = this.VisitBoundFunctionCall;
                    break;
                case "PrimitiveProperty":
                case "PrimitiveKeyProperty":
                case "PrimitiveCollectionProperty":
                case "ComplexProperty":
                case "ComplexCollectionProperty":
                case "EntityNavigationProperty":
                case "EntityCollectionNavigationProperty":
                    visitor = this.VisitProperty;
                    break;
                default:
                    visitor = this[`Visit${node.type}`];
            }
            if (visitor)
                visitor.call(this, node, context);
        }
        return this;
    }
    VisitODataUri(node, context) {
        this.Visit(node.value.query, context);
        this.Visit(node.value.resource, context);
    }
    VisitQueryOptions(node, context) {
        node.value.options.forEach((option) => this.Visit(option, context));
    }
    VisitExpand(node, context) {
        node.value.items.forEach((item) => {
            let expandPath = item.value.path.raw;
            let visitor = this.includes[expandPath];
            if (!visitor) {
                visitor = new ResourcePathVisitor();
                this.includes[expandPath] = visitor;
            }
            visitor.Visit(item);
        });
    }
    VisitExpandItem(node, context) {
        this.Visit(node.value.path, context);
        if (node.value.options) {
            this.ast = new lexer_1.Token(node);
            this.ast.type = lexer_1.TokenType.QueryOptions;
            this.ast.raw = node.value.options.map(n => n.raw).join("&");
            this.query = qs.parse(this.ast.raw);
            node.value.options.forEach((item) => this.Visit(item, context));
        }
    }
    VisitExpandPath(node, context) {
        this.navigationProperty = node.raw;
    }
    VisitId(node, context) {
        this.id = node.value;
    }
    VisitInlineCount(node, context) {
        this.inlinecount = odata_v4_literal_1.Literal.convert(node.value.value, node.value.raw);
    }
    VisitAliasAndValue(node, context) {
        this.Visit(node.value.value.value, context);
        this.alias[node.value.alias.value.name] = context.literal;
        delete context.literal;
    }
    VisitResourcePath(node, context) {
        this.Visit(node.value.resource, context);
        this.Visit(node.value.navigation, context);
    }
    VisitSingletonEntity(node, context) {
        this.singleton = node.raw;
    }
    VisitEntitySetName(node, context) {
        this.navigation.push({ name: node.value.name, type: node.type });
        this.path += "/" + node.value.name;
    }
    VisitCountExpression(node, context) {
        this.navigation.push({
            name: "$count",
            type: node.type,
            params: {}
        });
        this.path += "/$count";
    }
    ;
    VisitCollectionNavigation(node, context) {
        this.Visit(node.value.path, context);
    }
    VisitCollectionNavigationPath(node, context) {
        this.Visit(node.value.predicate, context);
        this.Visit(node.value.navigation, context);
    }
    VisitSimpleKey(node, context) {
        let lastNavigationPart = this.navigation[this.navigation.length - 1];
        lastNavigationPart.key = [{
                name: node.value.key,
                value: odata_v4_literal_1.Literal.convert(node.value.value.value, node.value.value.raw),
                raw: node.value.value.raw
            }];
        this.path += "(\\(([^,]+)\\))";
    }
    VisitCompoundKey(node, context) {
        this.path += "(\\(";
        let lastNavigationPart = this.navigation[this.navigation.length - 1];
        lastNavigationPart.key = node.value.map((pair, i) => {
            this.path += i == node.value.length - 1 ? "([^,]+)" : "([^,]+,)";
            return {
                name: pair.value.key.value.name,
                value: odata_v4_literal_1.Literal.convert(pair.value.value.value, pair.value.value.raw),
                raw: pair.value.value.raw
            };
        });
        this.path += "\\))";
    }
    VisitSingleNavigation(node, context) {
        this.Visit(node.value.path, context);
    }
    VisitPropertyPath(node, context) {
        this.Visit(node.value.path, context);
        this.Visit(node.value.navigation, context);
    }
    VisitProperty(node, context) {
        this.navigation.push({ name: node.value.name, type: node.type });
        this.path += "/" + node.value.name;
    }
    ;
    VisitValueExpression(node, context) {
        this.navigation.push({
            name: "$value",
            type: node.type,
            params: {}
        });
        this.path += "/$value";
    }
    VisitRefExpression(node, context) {
        this.navigation.push({
            name: "$ref",
            type: node.type,
            params: {}
        });
        this.path += "/$ref";
    }
    VisitBoundOperation(node, context) {
        this.Visit(node.value.operation, context);
        this.Visit(node.value.navigation, context);
    }
    VisitBoundActionCall(node, context) {
        let part = {
            type: node.type,
            name: node.raw
        };
        this.navigation.push(part);
        this.path += "/" + part.name;
    }
    VisitBoundFunctionCall(node, context) {
        let part = {
            type: node.type,
            name: node.value.call.value.namespace + "." + node.value.call.value.name,
            params: {}
        };
        this.navigation.push(part);
        this.path += "/" + part.name;
        this.path += "(\\(";
        node.value.params.value.forEach((param, i) => {
            this.Visit(param, context);
            if (i < node.value.params.value.length - 1)
                this.path += ",";
        });
        this.path += "\\))";
    }
    VisitFunctionImportCall(node, context) {
        let part = {
            type: node.type,
            name: node.value.import.value.name,
            params: {}
        };
        this.navigation.push(part);
        this.path += "/" + part.name;
        this.path += "(\\(";
        node.value.params.forEach((param) => this.Visit(param, context));
        this.path += "\\))";
    }
    VisitFunctionParameter(node, context) {
        this.Visit(node.value.value, context);
        let params = this.navigation[this.navigation.length - 1].params;
        params[node.value.name.value.name] = this.alias[node.value.name.value.name] || context.literal;
        this.path += node.value.name.value.name + "=([^,]+)";
        delete context.literal;
    }
    VisitActionImportCall(node, context) {
        let part = {
            type: node.value.type,
            name: node.value.value.name
        };
        this.navigation.push(part);
        this.path += "/" + part.name;
    }
    VisitParameterAlias(node, context) {
        context.literal = this.alias[node.value.name];
    }
    VisitLiteral(node, context) {
        context.literal = odata_v4_literal_1.Literal.convert(node.value, node.raw);
    }
}
exports.ResourcePathVisitor = ResourcePathVisitor;
//# sourceMappingURL=visitor.js.map