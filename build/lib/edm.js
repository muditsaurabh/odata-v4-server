"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** ?????????? */ // TODO: check & replace this pattern
require("reflect-metadata");
const utils_1 = require("./utils");
const EdmProperties = "edm:properties";
const EdmKeyProperties = "edm:keyproperties";
const EdmKeyProperty = "edm:keyproperty";
const EdmForeignKeys = "edm:foreignkeys";
const EdmComputedProperty = "edm:computedproperty";
const EdmNullableProperty = "edm:nullableproperty";
const EdmPartnerProperty = "edm:partnerproperty";
const EdmType = "edm:type";
const EdmElementType = "edm:elementtype";
const EdmComplexType = "edm:complextype";
const EdmEntityType = "edm:entitytype";
const EdmOperations = "edm:operations";
const EdmAction = "edm:action";
const EdmFunction = "edm:function";
const EdmReturnType = "edm:returntype";
const EdmParameters = "edm:parameters";
const EdmAnnotations = "edm:annotations";
const EdmConverter = "edm:converter";
const EdmMediaEntity = "edm:mediaentity";
const EdmOpenType = "emd:opentype";
const EdmChildren = "edm:children";
const EdmContainer = [];
/**
 * Defines OData Edm decorators
 *
 * @param type Edm decorator type
 * @return     Edm decorator
 */
function typeDecoratorFactory(type) {
    let decorator = function (target, targetKey, parameterIndex) {
        let baseType = Object.getPrototypeOf(target).constructor;
        if (baseType != Object && getProperties(baseType.prototype).length > 0) {
            EntityType()(baseType.prototype);
            let children = Reflect.getOwnMetadata(EdmChildren, baseType) || [];
            if (children.indexOf(target.constructor) < 0) {
                children.unshift(target.constructor);
            }
            Reflect.defineMetadata(EdmChildren, children, baseType);
        }
        if (typeof parameterIndex == "number") {
            let parameterNames = utils_1.getFunctionParameters(target, targetKey);
            let existingParameters = Reflect.getOwnMetadata(EdmParameters, target, targetKey) || [];
            let paramName = parameterNames[parameterIndex];
            let param = existingParameters.filter(p => p.name == paramName)[0];
            if (param) {
                param.type = type;
            }
            else {
                existingParameters.push({
                    name: paramName,
                    type: type
                });
            }
            Reflect.defineMetadata(EdmParameters, existingParameters, target, targetKey);
        }
        else {
            if (typeof target == "function") {
                register(target);
            }
            let desc = Object.getOwnPropertyDescriptor(target, targetKey);
            if (targetKey != EdmType && ((desc && typeof desc.value != "function") || (!desc && typeof target[targetKey] != "function"))) {
                let properties = Reflect.getOwnMetadata(EdmProperties, target) || [];
                if (properties.indexOf(targetKey) < 0)
                    properties.push(targetKey);
                Reflect.defineMetadata(EdmProperties, properties, target);
            }
            Reflect.defineMetadata(EdmType, type, target, targetKey);
        }
    };
    return function (...args) {
        if (arguments.length == 0)
            return decorator;
        else
            return decorator.apply(this, args);
    };
}
/** Edm.Binary primitive type property decorator */
exports.Binary = typeDecoratorFactory("Edm.Binary");
/** Edm.Boolean primitive type property decorator */
exports.Boolean = typeDecoratorFactory("Edm.Boolean");
/** Edm.Byte primitive type property decorator */
exports.Byte = typeDecoratorFactory("Edm.Byte");
/** Edm.Date primitive type property decorator */
exports.Date = typeDecoratorFactory("Edm.Date");
/** Edm.DateTimeOffset primitive type property decorator */
exports.DateTimeOffset = typeDecoratorFactory("Edm.DateTimeOffset");
/** Edm.Decimal primitive type property decorator */
exports.Decimal = typeDecoratorFactory("Edm.Decimal");
/** Edm.Double primitive type property decorator */
exports.Double = typeDecoratorFactory("Edm.Double");
/** Edm.Duration primitive type property decorator */
exports.Duration = typeDecoratorFactory("Edm.Duration");
/** Edm.Guid primitive type property decorator */
exports.Guid = typeDecoratorFactory("Edm.Guid");
/** Edm.Int16 primitive type property decorator */
exports.Int16 = typeDecoratorFactory("Edm.Int16");
/** Edm.Int32 primitive type property decorator */
exports.Int32 = typeDecoratorFactory("Edm.Int32");
/** Edm.Int64 primitive type property decorator */
exports.Int64 = typeDecoratorFactory("Edm.Int64");
/** Edm.SByte primitive type property decorator */
exports.SByte = typeDecoratorFactory("Edm.SByte");
/** Edm.Single primitive type property decorator */
exports.Single = typeDecoratorFactory("Edm.Single");
function Stream(target, targetKey) {
    if (typeof target == "string") {
        const contentType = target;
        return function (target, targetKey) {
            Reflect.defineMetadata(EdmMediaEntity, contentType, target, targetKey);
            typeDecoratorFactory("Edm.Stream")(target, targetKey);
        };
    }
    return typeDecoratorFactory("Edm.Stream").apply(this, arguments);
}
exports.Stream = Stream;
;
/** Edm.String primitive type property decorator */
exports.String = typeDecoratorFactory("Edm.String");
/** Edm.TimeOfDay primitive type property decorator */
exports.TimeOfDay = typeDecoratorFactory("Edm.TimeOfDay");
/** Edm.Geography primitive type property decorator */
exports.Geography = typeDecoratorFactory("Edm.Geography");
/** Edm.GeographyPoint primitive type property decorator */
exports.GeographyPoint = typeDecoratorFactory("Edm.GeographyPoint");
/** Edm.GeographyLineString primitive type property decorator */
exports.GeographyLineString = typeDecoratorFactory("Edm.GeographyLineString");
/** Edm.GeographyPolygon primitive type property decorator */
exports.GeographyPolygon = typeDecoratorFactory("Edm.GeographyPolygon");
/** Edm.GeographyMultiPoint primitive type property decorator */
exports.GeographyMultiPoint = typeDecoratorFactory("Edm.GeographyMultiPoint");
/** Edm.GeographyMultiLineString primitive type property decorator */
exports.GeographyMultiLineString = typeDecoratorFactory("Edm.GeographyMultiLineString");
/** Edm.GeographyMultiPolygon primitive type property decorator */
exports.GeographyMultiPolygon = typeDecoratorFactory("Edm.GeographyMultiPolygon");
/** Edm.GeographyCollection primitive type property decorator */
exports.GeographyCollection = (function GeographyCollection() {
    return typeDecoratorFactory("Edm.GeographyCollection");
})();
/** Edm.Geometry primitive type property decorator */
exports.Geometry = (function Geometry() {
    return typeDecoratorFactory("Edm.Geometry");
})();
/** Edm.GeometryPoint primitive type property decorator */
exports.GeometryPoint = (function GeometryPoint() {
    return typeDecoratorFactory("Edm.GeometryPoint");
})();
/** Edm.GeometryLineString primitive type property decorator */
exports.GeometryLineString = (function GeometryLineString() {
    return typeDecoratorFactory("Edm.GeometryLineString");
})();
/** Edm.GeometryPolygon primitive type property decorator */
exports.GeometryPolygon = (function GeometryPolygon() {
    return typeDecoratorFactory("Edm.GeometryPolygon");
})();
/** Edm.GeometryMultiPoint primitive type property decorator */
exports.GeometryMultiPoint = (function GeometryMultiPoint() {
    return typeDecoratorFactory("Edm.GeometryMultiPoint");
})();
/** Edm.GeometryMultiLineString primitive type property decorator */
exports.GeometryMultiLineString = (function GeometryMultiLineString() {
    return typeDecoratorFactory("Edm.GeometryMultiLineString");
})();
/** Edm.GeometryMultiPolygon primitive type property decorator */
exports.GeometryMultiPolygon = (function GeometryMultiPolygon() {
    return typeDecoratorFactory("Edm.GeometryMultiPolygon");
})();
/** Edm.GeometryCollection primitive type property decorator */
exports.GeometryCollection = (function GeometryCollection() {
    return typeDecoratorFactory("Edm.GeometryCollection");
})();
/** ?????????? */
/** Edm.Collection decorator for describing properties as collections */
function Collection(elementType) {
    return function (target, targetKey, parameterIndex) {
        if (typeof parameterIndex == "number") {
            let parameterNames = utils_1.getFunctionParameters(target, targetKey);
            let existingParameters = Reflect.getOwnMetadata(EdmParameters, target, targetKey) || [];
            let element = function Collection() { };
            Reflect.decorate([elementType()], element, EdmType);
            let elementTypeName = Reflect.getMetadata(EdmType, element, EdmType);
            if (typeof elementTypeName == "function") {
                elementTypeName = (elementTypeName.namespace || target.namespace) + "." + elementTypeName.name;
            }
            let paramName = parameterNames[parameterIndex];
            let param = existingParameters.filter(p => p.name == paramName)[0];
            if (param) {
                param.type = "Collection(" + elementTypeName + ")";
            }
            else {
                existingParameters.push({
                    name: paramName,
                    type: "Collection(" + elementTypeName + ")"
                });
            }
            Reflect.defineMetadata(EdmParameters, existingParameters, target, targetKey);
        }
        else {
            if (typeof target == "function") {
                register(target);
            }
            let baseType = Object.getPrototypeOf(target).constructor;
            if (baseType != Object && getProperties(baseType.prototype).length > 0) {
                EntityType()(baseType.prototype);
                let children = Reflect.getOwnMetadata(EdmChildren, baseType) || [];
                if (children.indexOf(target.constructor) < 0) {
                    children.unshift(target.constructor);
                }
                Reflect.defineMetadata(EdmChildren, children, baseType);
            }
            let desc = Object.getOwnPropertyDescriptor(target, targetKey);
            if ((desc && typeof desc.value != "function") || (!desc && typeof target[targetKey] != "function")) {
                let properties = Reflect.getOwnMetadata(EdmProperties, target) || [];
                if (properties.indexOf(targetKey) < 0)
                    properties.push(targetKey);
                Reflect.defineMetadata(EdmProperties, properties, target);
            }
            let element = function Collection() { };
            try {
                Reflect.decorate([elementType()], element, EdmType);
            }
            catch (err) {
                Reflect.decorate([elementType], element, EdmType);
            }
            let type = Reflect.getMetadata(EdmComplexType, element, EdmType);
            let elementTypeName = Reflect.getMetadata(EdmType, element, EdmType);
            Reflect.defineMetadata(EdmType, "Collection", target, targetKey);
            Reflect.defineMetadata(EdmElementType, elementTypeName, target, targetKey);
            if (type) {
                Reflect.defineMetadata(EdmComplexType, type, target, targetKey);
            }
            else {
                type = Reflect.getMetadata(EdmEntityType, element, EdmType);
                Reflect.defineMetadata(EdmEntityType, type, target, targetKey);
            }
        }
    };
}
exports.Collection = Collection;
/** ?????????? */
function getTypeName(target, propertyKey) {
    let type = Reflect.getMetadata(EdmType, target.prototype, propertyKey) || Reflect.getMetadata(EdmType, target.prototype);
    let elementType = Reflect.getMetadata(EdmElementType, target.prototype, propertyKey) || Reflect.getMetadata(EdmElementType, target.prototype);
    if (typeof type == "string" && type != "Collection" && type.indexOf(".") < 0) {
        for (let i = 0; i < EdmContainer.length; i++) {
            let containerType = EdmContainer[i];
            let namespace = containerType.namespace || target.namespace || "Default";
            let containerTypeName = containerType.name;
            if (containerTypeName == type) {
                type = namespace + "." + type;
                break;
            }
        }
    }
    else if (typeof type == "function") {
        if (type.__forward__ref__) {
            type = (type.namespace || target.namespace || "Default") + "." + type().name;
        }
        else
            type = (type.namespace || target.namespace || "Default") + "." + type.name;
    }
    if (typeof elementType == "string" && elementType != "Collection" && elementType.indexOf(".") < 0) {
        for (let i = 0; i < EdmContainer.length; i++) {
            let containerType = EdmContainer[i];
            let namespace = containerType.namespace || target.namespace || "Default";
            let containerTypeName = containerType.name;
            if (containerTypeName == elementType) {
                elementType = namespace + "." + elementType;
                break;
            }
        }
    }
    else if (typeof elementType == "function") {
        elementType = (elementType.namespace || target.namespace || "Default") + "." + elementType.name;
    }
    return elementType ? type + "(" + elementType + ")" : type;
}
exports.getTypeName = getTypeName;
/** ?????????? */
function getType(target, propertyKey) {
    let type = Reflect.getMetadata(EdmType, target.prototype, propertyKey);
    let elementType = Reflect.getMetadata(EdmElementType, target.prototype, propertyKey);
    let hasEntityType = isEntityType(target, propertyKey);
    if (!elementType)
        elementType = type;
    if (hasEntityType) {
        if (elementType.__forward__ref__)
            elementType = elementType();
        if (type.__forward__ref__)
            type = type();
        if (typeof elementType == "string" && elementType.indexOf(".") < 0)
            elementType = (target.namespace || "Default") + "." + elementType;
        if (typeof type == "string" && type.indexOf(".") < 0)
            type = (target.namespace || "Default") + "." + type;
    }
    if (typeof elementType == "string") {
        for (let i = 0; i < EdmContainer.length; i++) {
            let containerType = EdmContainer[i];
            let namespace = containerType.namespace || target.namespace || "Default";
            let containerTypeName = (namespace ? namespace + "." : "") + containerType.name;
            if (containerTypeName == elementType) {
                return containerType;
            }
        }
    }
    return elementType;
}
exports.getType = getType;
/** Returns true if property is a collection (decorated by Edm.Collection) */
function isCollection(target, propertyKey) {
    return Reflect.getMetadata(EdmType, target.prototype, propertyKey) == "Collection";
}
exports.isCollection = isCollection;
/** ?????????? */
function getProperties(target) {
    return Reflect.getOwnMetadata(EdmProperties, target) || [];
}
exports.getProperties = getProperties;
/** ?????????? */
function getParameters(target, targetKey) {
    return Reflect.getOwnMetadata(EdmParameters, target.prototype, targetKey) || [];
}
exports.getParameters = getParameters;
function getChildren(target) {
    return Reflect.getMetadata(EdmChildren, target) || [];
}
exports.getChildren = getChildren;
/** Edm.Key decorator for describing properties as keys */
exports.Key = (function Key() {
    return function (target, targetKey) {
        if (typeof target == "function") {
            register(target);
        }
        let properties = Reflect.getOwnMetadata(EdmKeyProperties, target) || [];
        if (properties.indexOf(targetKey) < 0)
            properties.push(targetKey);
        Reflect.defineMetadata(EdmKeyProperties, properties, target);
        Reflect.defineMetadata(EdmKeyProperty, true, target, targetKey);
    };
})();
/** Returns true if property is a key (decorated by Edm.Key) */
function isKey(target, propertyKey) {
    return Reflect.getMetadata(EdmKeyProperty, target.prototype, propertyKey) || false;
}
exports.isKey = isKey;
/** Returns property names that build up the key (names of properties decorated by Edm.Key) */
function getKeyProperties(target) {
    return Reflect.getOwnMetadata(EdmKeyProperties, target) || Reflect.getOwnMetadata(EdmKeyProperties, target.prototype) || [];
}
exports.getKeyProperties = getKeyProperties;
/**
 * Returns escaped strings according to the OData format
 * Strings are quoted in single quotes therefore single quotes in strings are converted to two singlequotes.
 * Binary values are converted to hexadecimal strings.
 *
 * @param value Input value of any type
 * @param type  OData type of the provided value
 * @return      Escaped string
 */
function escape(value, type) {
    if (typeof value == "undefined" || value == null)
        return value;
    switch (type) {
        case "Edm.Binary":
            return value.toString("hex");
        case "Edm.Boolean":
        case "Edm.Byte":
        case "Edm.Decimal":
        case "Edm.Double":
        case "Edm.Guid":
        case "Edm.Int16":
        case "Edm.Int32":
        case "Edm.Int64":
        case "Edm.SByte":
        case "Edm.Single":
            return value.toString();
        case "Edm.String": return "'" + ("" + value).replace(/'/g, "''") + "'";
    }
}
exports.escape = escape;
/** Edm.Computed decorator for describing computed properties */
exports.Computed = (function Computed() {
    return function (target, targetKey) {
        if (typeof target == "function") {
            register(target);
        }
        Reflect.defineMetadata(EdmComputedProperty, true, target, targetKey);
    };
})();
/** Returns true if property is computed (decorated by Edm.Computed) */
function isComputed(target, propertyKey) {
    return Reflect.getMetadata(EdmComputedProperty, target.prototype, propertyKey) || false;
}
exports.isComputed = isComputed;
/** Edm.Nullable decorator for describing nullable properties (which can be missing) */
exports.Nullable = (function Nullable() {
    return function (target, targetKey, parameterIndex) {
        if (typeof parameterIndex == "number") {
            let parameterNames = utils_1.getFunctionParameters(target, targetKey);
            let existingParameters = Reflect.getOwnMetadata(EdmParameters, target, targetKey) || [];
            let paramName = parameterNames[parameterIndex];
            let param = existingParameters.filter(p => p.name == paramName)[0];
            if (param) {
                param.nullable = true;
            }
            else {
                existingParameters.push({
                    name: parameterNames[parameterIndex],
                    nullable: true
                });
            }
            Reflect.defineMetadata(EdmParameters, existingParameters, target, targetKey);
        }
        else {
            if (typeof target == "function") {
                register(target);
            }
            Reflect.defineMetadata(EdmNullableProperty, true, target, targetKey);
        }
    };
})();
/** Returns true if property is nullable (decorated by Edm.Nullable) */
function isNullable(target, propertyKey) {
    return Reflect.getMetadata(EdmNullableProperty, target.prototype, propertyKey);
}
exports.isNullable = isNullable;
/** Edm.Required decorator for describing non-nullable properties that must have value (cannot be missing) */
exports.Required = (function Required() {
    return function (target, targetKey, parameterIndex) {
        if (typeof parameterIndex == "number") {
            let parameterNames = utils_1.getFunctionParameters(target, targetKey);
            let existingParameters = Reflect.getOwnMetadata(EdmParameters, target, targetKey) || [];
            let paramName = parameterNames[parameterIndex];
            let param = existingParameters.filter(p => p.name == paramName)[0];
            if (param) {
                param.nullable = false;
            }
            else {
                existingParameters.push({
                    name: parameterNames[parameterIndex],
                    nullable: false
                });
            }
            Reflect.defineMetadata(EdmParameters, existingParameters, target, targetKey);
        }
        else {
            if (typeof target == "function") {
                register(target);
            }
            Reflect.defineMetadata(EdmNullableProperty, false, target, targetKey);
        }
    };
})();
/** Returns true if property is required (decorated by Edm.Required) */
function isRequired(target, propertyKey) {
    return Reflect.getMetadata(EdmNullableProperty, target.prototype, propertyKey) == false ? true : false;
}
exports.isRequired = isRequired;
function operationDecoratorFactory(type, returnType) {
    return function (target, targetKey) {
        let element = function () { };
        element.target = target;
        element.targetKey = targetKey;
        if (typeof returnType == "function") {
            try {
                Reflect.decorate([returnType()], element.prototype, EdmReturnType);
            }
            catch (err) {
                returnType(element.prototype, EdmReturnType);
            }
        }
        let existingOperations = Reflect.getOwnMetadata(EdmOperations, target) || [];
        existingOperations.push(targetKey);
        Reflect.defineMetadata(EdmOperations, existingOperations, target);
        Reflect.defineMetadata(type, type, target, targetKey);
        Reflect.defineMetadata(EdmReturnType, element, target, targetKey);
    };
}
/** Edm.ActionImport decorator for describing unbound actions callable from the service root */
exports.ActionImport = operationDecoratorFactory(EdmAction);
/** Edm.Action decorator for describing actions */
exports.Action = operationDecoratorFactory(EdmAction);
function FunctionImport(target, targetKey) {
    if (arguments.length > 1)
        operationDecoratorFactory(EdmFunction)(target, targetKey);
    else
        return operationDecoratorFactory(EdmFunction, target);
}
exports.FunctionImport = FunctionImport;
function Function(target, targetKey) {
    if (arguments.length > 1)
        operationDecoratorFactory(EdmFunction)(target, targetKey);
    else
        return operationDecoratorFactory(EdmFunction, target);
}
exports.Function = Function;
/** ?????????? */
function getOperations(target) {
    return Reflect.getOwnMetadata(EdmOperations, target.prototype) || [];
}
exports.getOperations = getOperations;
/** ?????????? */
function getReturnTypeName(target, propertyKey) {
    let returnType = Reflect.getMetadata(EdmReturnType, target.prototype, propertyKey);
    return getTypeName(returnType, EdmReturnType) || getTypeName(target, propertyKey);
}
exports.getReturnTypeName = getReturnTypeName;
/** ?????????? */
function getReturnType(target, propertyKey) {
    let returnType = Reflect.getMetadata(EdmReturnType, target.prototype, propertyKey);
    return getType(returnType, EdmReturnType) || getType(target, propertyKey);
}
exports.getReturnType = getReturnType;
/** Returns true if property is a statically callable action (decorated by Edm.ActionImport) */
function isActionImport(target, propertyKey) {
    return Reflect.getMetadata(EdmAction, target.prototype, propertyKey) || false;
}
exports.isActionImport = isActionImport;
/** Returns true if property is a statically callable function (decorated by Edm.FunctionImport) */
function isFunctionImport(target, propertyKey) {
    return Reflect.getMetadata(EdmFunction, target.prototype, propertyKey) || false;
}
exports.isFunctionImport = isFunctionImport;
/** Returns true if property is an action (decorated by Edm.Action) */
function isAction(target, propertyKey) {
    return Reflect.getMetadata(EdmAction, target.prototype, propertyKey) || false;
}
exports.isAction = isAction;
/** Returns true if property is an function (decorated by Edm.Function) */
function isFunction(target, propertyKey) {
    return Reflect.getMetadata(EdmFunction, target.prototype, propertyKey) || false;
}
exports.isFunction = isFunction;
/** Edm.ComplexType decorator for describing properties of complex types */
function ComplexType(type) {
    return function (target, targetKey) {
        if (typeof target == "function") {
            register(target);
        }
        let baseType = Object.getPrototypeOf(target).constructor;
        if (baseType != Object && getProperties(baseType.prototype).length > 0) {
            EntityType()(baseType.prototype);
            let children = Reflect.getOwnMetadata(EdmChildren, baseType) || [];
            if (children.indexOf(target.constructor) < 0) {
                children.unshift(target.constructor);
            }
            Reflect.defineMetadata(EdmChildren, children, baseType);
        }
        let desc = Object.getOwnPropertyDescriptor(target, targetKey);
        if (targetKey && targetKey != EdmType && ((desc && typeof desc.value != "function") || (!desc && typeof target[targetKey] != "function"))) {
            let properties = Reflect.getOwnMetadata(EdmProperties, target) || [];
            if (properties.indexOf(targetKey) < 0)
                properties.push(targetKey);
            Reflect.defineMetadata(EdmProperties, properties, target);
        }
        Reflect.defineMetadata(EdmComplexType, type, target, targetKey);
        Reflect.defineMetadata(EdmType, type, target, targetKey);
    };
}
exports.ComplexType = ComplexType;
/** Returns true if property is a complex type (decorated by Edm.ComplexType) */
function isComplexType(target, propertyKey) {
    return Reflect.hasMetadata(EdmComplexType, target.prototype, propertyKey);
}
exports.isComplexType = isComplexType;
/** Edm.MediaEntity decorator for describing media entity properties */
function MediaEntity(contentType) {
    return Reflect.metadata(EdmMediaEntity, contentType);
}
exports.MediaEntity = MediaEntity;
/** Returns true if property is a media entity (decorated by Edm.MediaEntity) */
function isMediaEntity(target) {
    return Reflect.hasMetadata(EdmMediaEntity, target);
}
exports.isMediaEntity = isMediaEntity;
/** ?????????? */
function getContentType(target, targetKey) {
    return Reflect.getMetadata(EdmMediaEntity, target, targetKey);
}
exports.getContentType = getContentType;
/** Edm.OpenType decorator for describing open type properties */
exports.OpenType = (function OpenType() {
    return Reflect.metadata(EdmOpenType, true);
})();
/** Returns true if property is a open type (decorated by Edm.OpenType) */
function isOpenType(target) {
    return Reflect.hasMetadata(EdmOpenType, target) || false;
}
exports.isOpenType = isOpenType;
/** ?????????? */
/** Edm.EntityType decorator for describing entity types */
function EntityType(type) {
    return function (target, targetKey) {
        if (typeof target == "function") {
            register(target);
        }
        let desc = Object.getOwnPropertyDescriptor(target, targetKey);
        if (targetKey && targetKey != EdmType && ((desc && typeof desc.value != "function") || (!desc && typeof target[targetKey] != "function"))) {
            let properties = Reflect.getOwnMetadata(EdmProperties, target) || [];
            if (properties.indexOf(targetKey) < 0)
                properties.push(targetKey);
            Reflect.defineMetadata(EdmProperties, properties, target);
        }
        Reflect.defineMetadata(EdmEntityType, type, target, targetKey);
        Reflect.defineMetadata(EdmType, type, target, targetKey);
    };
}
exports.EntityType = EntityType;
/** Returns true if property is an EntityType (decorated by Edm.EntityType) */
function isEntityType(target, propertyKey) {
    return Reflect.hasMetadata(EdmEntityType, target.prototype, propertyKey);
}
exports.isEntityType = isEntityType;
/** ?????????? */
function register(type) {
    if (EdmContainer.indexOf(type) < 0)
        EdmContainer.push(type);
}
exports.register = register;
/** ?????????? */
function Convert(converter) {
    return function (target, targetKey) {
        if (typeof target == "function") {
            register(target);
        }
        Reflect.defineMetadata(EdmConverter, converter, target, targetKey);
    };
}
exports.Convert = Convert;
/** ?????????? */
function getConverter(target, propertyKey) {
    return Reflect.getMetadata(EdmConverter, target.prototype, propertyKey);
}
exports.getConverter = getConverter;
/** ?????????? */
function Annotate(...annotation) {
    return function (target, targetKey) {
        if (typeof target == "function") {
            register(target);
        }
        let existingAnnotations = Reflect.getOwnMetadata(EdmAnnotations, target, targetKey) || [];
        existingAnnotations = annotation.concat(existingAnnotations);
        Reflect.defineMetadata(EdmAnnotations, existingAnnotations, target, targetKey);
    };
}
exports.Annotate = Annotate;
/** ?????????? */
function getAnnotations(target, targetKey) {
    return Reflect.getOwnMetadata(EdmAnnotations, target.prototype, targetKey) || Reflect.getOwnMetadata(EdmAnnotations, target, targetKey) || [];
}
exports.getAnnotations = getAnnotations;
/** ?????????? */
/** Edm.ForeignKey decorator for describing properties as foreign keys */
function ForeignKey(...keys) {
    return function (target, targetKey) {
        if (typeof target == "function") {
            register(target);
        }
        let existingForeignKeys = Reflect.getOwnMetadata(EdmForeignKeys, target, targetKey) || [];
        existingForeignKeys = keys.concat(existingForeignKeys);
        Reflect.defineMetadata(EdmForeignKeys, existingForeignKeys, target, targetKey);
    };
}
exports.ForeignKey = ForeignKey;
/** ?????????? */
/** Edm.ForeignKey decorator for describing properties as foreign keys */
function getForeignKeys(target, targetKey) {
    return Reflect.getOwnMetadata(EdmForeignKeys, target.prototype, targetKey) || Reflect.getOwnMetadata(EdmForeignKeys, target, targetKey) || [];
}
exports.getForeignKeys = getForeignKeys;
/** ?????????? */
/** Returns property names that are foreign keys (names of properties decorated by Edm.ForeignKey) */
function Partner(property) {
    return Reflect.metadata(EdmPartnerProperty, property);
}
exports.Partner = Partner;
/** ?????????? */
function getPartner(target, targetKey) {
    return Reflect.getMetadata(EdmPartnerProperty, target, targetKey) || Reflect.getMetadata(EdmPartnerProperty, target.prototype, targetKey);
}
exports.getPartner = getPartner;
/** ?????????? */
/** Edm.EntitySet decorator for describing entity sets */
function EntitySet(name) {
    return function (controller) {
        controller.prototype.entitySetName = name;
    };
}
exports.EntitySet = EntitySet;
/** Helper function to use references declared later
 * @param forwardRefFn a function returning the reference
 */
function ForwardRef(forwardRefFn) {
    const fwd = function () {
        return forwardRefFn();
    };
    fwd.__forward__ref__ = true;
    return fwd;
}
exports.ForwardRef = ForwardRef;
//# sourceMappingURL=edm.js.map