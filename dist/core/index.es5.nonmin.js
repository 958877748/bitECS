"use strict";
var bitecs = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // dist/es5/core/utils/defineHiddenProperty.js
  var require_defineHiddenProperty = __commonJS({
    "dist/es5/core/utils/defineHiddenProperty.js"(exports) {
      "use strict";
      var __assign = exports && exports.__assign || function() {
        __assign = Object.assign || function(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
          }
          return t;
        };
        return __assign.apply(this, arguments);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.defineHiddenProperties = exports.defineHiddenProperty = void 0;
      var defineHiddenProperty = function(obj, key, value) {
        return Object.defineProperty(obj, key, {
          value,
          enumerable: false,
          writable: true,
          configurable: true
        });
      };
      exports.defineHiddenProperty = defineHiddenProperty;
      var defineHiddenProperties = function(obj, kv) {
        var descriptors = {
          enumerable: false,
          writable: true,
          configurable: true
        };
        Object.defineProperties(obj, Reflect.ownKeys(kv).reduce(function(a, k) {
          var _a;
          return Object.assign(a, (_a = {}, _a[k] = __assign({ value: kv[k] }, descriptors), _a));
        }, {}));
      };
      exports.defineHiddenProperties = defineHiddenProperties;
    }
  });

  // dist/es5/core/EntityIndex.js
  var require_EntityIndex = __commonJS({
    "dist/es5/core/EntityIndex.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.isEntityIdAlive = exports.removeEntityId = exports.addEntityId = exports.createEntityIndex = exports.withVersioning = exports.incrementVersion = exports.getVersion = exports.getId = void 0;
      var getId = function(index, id) {
        return id & index.entityMask;
      };
      exports.getId = getId;
      var getVersion = function(index, id) {
        return id >>> index.versionShift & (1 << index.versionBits) - 1;
      };
      exports.getVersion = getVersion;
      var incrementVersion = function(index, id) {
        var currentVersion = (0, exports.getVersion)(index, id);
        var newVersion = currentVersion + 1 & (1 << index.versionBits) - 1;
        return id & index.entityMask | newVersion << index.versionShift;
      };
      exports.incrementVersion = incrementVersion;
      var withVersioning = function(versionBits) {
        return {
          versioning: true,
          versionBits
        };
      };
      exports.withVersioning = withVersioning;
      var createEntityIndex = function(options) {
        var _a, _b;
        var config = options ? typeof options === "function" ? options() : options : { versioning: false, versionBits: 8 };
        var versionBits = (_a = config.versionBits) !== null && _a !== void 0 ? _a : 8;
        var versioning = (_b = config.versioning) !== null && _b !== void 0 ? _b : false;
        var entityBits = 32 - versionBits;
        var entityMask = (1 << entityBits) - 1;
        var versionShift = entityBits;
        var versionMask = (1 << versionBits) - 1 << versionShift;
        return {
          aliveCount: 0,
          dense: [],
          sparse: [],
          maxId: 0,
          versioning,
          versionBits,
          entityMask,
          versionShift,
          versionMask
        };
      };
      exports.createEntityIndex = createEntityIndex;
      var addEntityId = function(index) {
        if (index.aliveCount < index.dense.length) {
          var recycledId = index.dense[index.aliveCount];
          var entityId = recycledId;
          index.sparse[entityId] = index.aliveCount;
          index.aliveCount++;
          return recycledId;
        }
        var id = ++index.maxId;
        index.dense.push(id);
        index.sparse[id] = index.aliveCount;
        index.aliveCount++;
        return id;
      };
      exports.addEntityId = addEntityId;
      var removeEntityId = function(index, id) {
        var denseIndex = index.sparse[id];
        if (denseIndex === void 0 || denseIndex >= index.aliveCount) {
          return;
        }
        var lastIndex = index.aliveCount - 1;
        var lastId = index.dense[lastIndex];
        index.sparse[lastId] = denseIndex;
        index.dense[denseIndex] = lastId;
        index.sparse[id] = lastIndex;
        index.dense[lastIndex] = id;
        if (index.versioning) {
          var newId = (0, exports.incrementVersion)(index, id);
          index.dense[lastIndex] = newId;
        }
        index.aliveCount--;
      };
      exports.removeEntityId = removeEntityId;
      var isEntityIdAlive = function(index, id) {
        var entityId = (0, exports.getId)(index, id);
        var denseIndex = index.sparse[entityId];
        return denseIndex !== void 0 && denseIndex < index.aliveCount && index.dense[denseIndex] === id;
      };
      exports.isEntityIdAlive = isEntityIdAlive;
    }
  });

  // dist/es5/core/World.js
  var require_World = __commonJS({
    "dist/es5/core/World.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.getAllEntities = exports.getWorldComponents = exports.deleteWorld = exports.resetWorld = exports.$internal = void 0;
      exports.createWorld = createWorld;
      var defineHiddenProperty_1 = require_defineHiddenProperty();
      var EntityIndex_1 = require_EntityIndex();
      exports.$internal = Symbol.for("bitecs_internal");
      var createBaseWorld = function(context, entityIndex) {
        return (0, defineHiddenProperty_1.defineHiddenProperty)(context || {}, exports.$internal, {
          entityIndex: entityIndex || (0, EntityIndex_1.createEntityIndex)(),
          entityMasks: [[]],
          entityComponents: /* @__PURE__ */ new Map(),
          bitflag: 1,
          componentMap: /* @__PURE__ */ new Map(),
          componentCount: 0,
          queries: /* @__PURE__ */ new Set(),
          queriesHashMap: /* @__PURE__ */ new Map(),
          notQueries: /* @__PURE__ */ new Set(),
          dirtyQueries: /* @__PURE__ */ new Set(),
          entitiesWithRelations: /* @__PURE__ */ new Set(),
          hierarchyData: /* @__PURE__ */ new Map(),
          hierarchyActiveRelations: /* @__PURE__ */ new Set(),
          hierarchyQueryCache: /* @__PURE__ */ new Map()
        });
      };
      function createWorld() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        var entityIndex;
        var context;
        args.forEach(function(arg) {
          if (typeof arg === "object" && "dense" in arg && "sparse" in arg && "aliveCount" in arg) {
            entityIndex = arg;
          } else if (typeof arg === "object") {
            context = arg;
          }
        });
        return createBaseWorld(context, entityIndex);
      }
      var resetWorld = function(world) {
        var ctx = world[exports.$internal];
        ctx.entityIndex = (0, EntityIndex_1.createEntityIndex)();
        ctx.entityMasks = [[]];
        ctx.entityComponents = /* @__PURE__ */ new Map();
        ctx.bitflag = 1;
        ctx.componentMap = /* @__PURE__ */ new Map();
        ctx.componentCount = 0;
        ctx.queries = /* @__PURE__ */ new Set();
        ctx.queriesHashMap = /* @__PURE__ */ new Map();
        ctx.notQueries = /* @__PURE__ */ new Set();
        ctx.dirtyQueries = /* @__PURE__ */ new Set();
        ctx.entitiesWithRelations = /* @__PURE__ */ new Set();
        ctx.hierarchyData = /* @__PURE__ */ new Map();
        ctx.hierarchyActiveRelations = /* @__PURE__ */ new Set();
        ctx.hierarchyQueryCache = /* @__PURE__ */ new Map();
        return world;
      };
      exports.resetWorld = resetWorld;
      var deleteWorld = function(world) {
        delete world[exports.$internal];
      };
      exports.deleteWorld = deleteWorld;
      var getWorldComponents = function(world) {
        return Object.keys(world[exports.$internal].componentMap);
      };
      exports.getWorldComponents = getWorldComponents;
      var getAllEntities = function(world) {
        return Array.from(world[exports.$internal].entityComponents.keys());
      };
      exports.getAllEntities = getAllEntities;
    }
  });

  // dist/es5/core/utils/SparseSet.js
  var require_SparseSet = __commonJS({
    "dist/es5/core/utils/SparseSet.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.createUint32SparseSet = exports.createSparseSet = void 0;
      var createSparseSet = function() {
        var dense = [];
        var sparse = [];
        var has = function(val) {
          return dense[sparse[val]] === val;
        };
        var add = function(val) {
          if (has(val))
            return;
          sparse[val] = dense.push(val) - 1;
        };
        var remove = function(val) {
          if (!has(val))
            return;
          var index = sparse[val];
          var swapped = dense.pop();
          if (swapped !== val) {
            dense[index] = swapped;
            sparse[swapped] = index;
          }
        };
        var reset = function() {
          dense.length = 0;
          sparse.length = 0;
        };
        var sort = function(compareFn) {
          dense.sort(compareFn);
          for (var i = 0; i < dense.length; i++) {
            sparse[dense[i]] = i;
          }
        };
        return {
          add,
          remove,
          has,
          sparse,
          dense,
          reset,
          sort
        };
      };
      exports.createSparseSet = createSparseSet;
      var SharedArrayBufferOrArrayBuffer = typeof SharedArrayBuffer !== "undefined" ? SharedArrayBuffer : ArrayBuffer;
      var createUint32SparseSet = function(initialCapacity) {
        if (initialCapacity === void 0) {
          initialCapacity = 1e3;
        }
        var sparse = [];
        var length = 0;
        var dense = new Uint32Array(new SharedArrayBufferOrArrayBuffer(initialCapacity * 4));
        var has = function(val) {
          return val < sparse.length && sparse[val] < length && dense[sparse[val]] === val;
        };
        var add = function(val) {
          if (has(val))
            return;
          if (length >= dense.length) {
            var newDense = new Uint32Array(new SharedArrayBufferOrArrayBuffer(dense.length * 2 * 4));
            newDense.set(dense);
            dense = newDense;
          }
          dense[length] = val;
          sparse[val] = length;
          length++;
        };
        var remove = function(val) {
          if (!has(val))
            return;
          length--;
          var index = sparse[val];
          var swapped = dense[length];
          dense[index] = swapped;
          sparse[swapped] = index;
        };
        var reset = function() {
          length = 0;
          sparse.length = 0;
        };
        var sort = function(compareFn) {
          var temp = Array.from(dense.subarray(0, length));
          temp.sort(compareFn);
          for (var i = 0; i < temp.length; i++) {
            dense[i] = temp[i];
          }
          for (var i = 0; i < length; i++) {
            sparse[dense[i]] = i;
          }
        };
        return {
          add,
          remove,
          has,
          sparse,
          get dense() {
            return new Uint32Array(dense.buffer, 0, length);
          },
          reset,
          sort
        };
      };
      exports.createUint32SparseSet = createUint32SparseSet;
    }
  });

  // dist/es5/core/utils/Observer.js
  var require_Observer = __commonJS({
    "dist/es5/core/utils/Observer.js"(exports) {
      "use strict";
      var __assign = exports && exports.__assign || function() {
        __assign = Object.assign || function(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
          }
          return t;
        };
        return __assign.apply(this, arguments);
      };
      var __read = exports && exports.__read || function(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        } catch (error) {
          e = { error };
        } finally {
          try {
            if (r && !r.done && (m = i["return"])) m.call(i);
          } finally {
            if (e) throw e.error;
          }
        }
        return ar;
      };
      var __spreadArray = exports && exports.__spreadArray || function(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
          if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
          }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.createObservable = void 0;
      var createObservable = function() {
        var observers = /* @__PURE__ */ new Set();
        var subscribe = function(observer) {
          observers.add(observer);
          return function() {
            observers.delete(observer);
          };
        };
        var notify = function(entity) {
          var args = [];
          for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
          }
          return Array.from(observers).reduce(function(acc, listener) {
            var result = listener.apply(void 0, __spreadArray([entity], __read(args), false));
            return result && typeof result === "object" ? __assign(__assign({}, acc), result) : acc;
          }, {});
        };
        return {
          subscribe,
          notify
        };
      };
      exports.createObservable = createObservable;
    }
  });

  // dist/es5/core/Relation.js
  var require_Relation = __commonJS({
    "dist/es5/core/Relation.js"(exports) {
      "use strict";
      var __values = exports && exports.__values || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
          next: function() {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
          }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.IsA = exports.Wildcard = exports.$wildcard = exports.getRelationTargets = exports.Pair = exports.withOnTargetRemoved = exports.withAutoRemoveSubject = exports.makeExclusive = exports.withStore = exports.$relationData = exports.$isPairComponent = exports.$pairTarget = exports.$relation = void 0;
      exports.createRelation = createRelation;
      exports.createWildcardRelation = createWildcardRelation;
      exports.getWildcard = getWildcard;
      exports.createIsARelation = createIsARelation;
      exports.getIsA = getIsA;
      exports.isWildcard = isWildcard;
      exports.isRelation = isRelation;
      var _1 = require_core();
      var defineHiddenProperty_1 = require_defineHiddenProperty();
      exports.$relation = Symbol.for("bitecs-relation");
      exports.$pairTarget = Symbol.for("bitecs-pairTarget");
      exports.$isPairComponent = Symbol.for("bitecs-isPairComponent");
      exports.$relationData = Symbol.for("bitecs-relationData");
      var createBaseRelation = function() {
        var data = {
          pairsMap: /* @__PURE__ */ new Map(),
          initStore: void 0,
          exclusiveRelation: false,
          autoRemoveSubject: false,
          onTargetRemoved: void 0
        };
        var relation = function(target) {
          if (target === void 0)
            throw Error("Relation target is undefined");
          var normalizedTarget = target === "*" ? exports.Wildcard : target;
          if (!data.pairsMap.has(normalizedTarget)) {
            var component = data.initStore ? data.initStore(target) : {};
            (0, defineHiddenProperty_1.defineHiddenProperty)(component, exports.$relation, relation);
            (0, defineHiddenProperty_1.defineHiddenProperty)(component, exports.$pairTarget, normalizedTarget);
            (0, defineHiddenProperty_1.defineHiddenProperty)(component, exports.$isPairComponent, true);
            data.pairsMap.set(normalizedTarget, component);
          }
          return data.pairsMap.get(normalizedTarget);
        };
        (0, defineHiddenProperty_1.defineHiddenProperty)(relation, exports.$relationData, data);
        return relation;
      };
      var withStore = function(createStore) {
        return function(relation) {
          var ctx = relation[exports.$relationData];
          ctx.initStore = createStore;
          return relation;
        };
      };
      exports.withStore = withStore;
      var makeExclusive = function(relation) {
        var ctx = relation[exports.$relationData];
        ctx.exclusiveRelation = true;
        return relation;
      };
      exports.makeExclusive = makeExclusive;
      var withAutoRemoveSubject = function(relation) {
        var ctx = relation[exports.$relationData];
        ctx.autoRemoveSubject = true;
        return relation;
      };
      exports.withAutoRemoveSubject = withAutoRemoveSubject;
      var withOnTargetRemoved = function(onRemove) {
        return function(relation) {
          var ctx = relation[exports.$relationData];
          ctx.onTargetRemoved = onRemove;
          return relation;
        };
      };
      exports.withOnTargetRemoved = withOnTargetRemoved;
      var Pair = function(relation, target) {
        if (relation === void 0)
          throw Error("Relation is undefined");
        return relation(target);
      };
      exports.Pair = Pair;
      var getRelationTargets = function(world, eid, relation) {
        var e_1, _a;
        var components = (0, _1.getEntityComponents)(world, eid);
        var targets = [];
        try {
          for (var components_1 = __values(components), components_1_1 = components_1.next(); !components_1_1.done; components_1_1 = components_1.next()) {
            var c = components_1_1.value;
            if (c[exports.$relation] === relation && c[exports.$pairTarget] !== exports.Wildcard && !isRelation(c[exports.$pairTarget])) {
              targets.push(c[exports.$pairTarget]);
            }
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (components_1_1 && !components_1_1.done && (_a = components_1.return)) _a.call(components_1);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
        return targets;
      };
      exports.getRelationTargets = getRelationTargets;
      function createRelation() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        if (args.length === 1 && typeof args[0] === "object") {
          var _a = args[0], store = _a.store, exclusive = _a.exclusive, autoRemoveSubject = _a.autoRemoveSubject, onTargetRemoved = _a.onTargetRemoved;
          var modifiers = [
            store && (0, exports.withStore)(store),
            exclusive && exports.makeExclusive,
            autoRemoveSubject && exports.withAutoRemoveSubject,
            onTargetRemoved && (0, exports.withOnTargetRemoved)(onTargetRemoved)
          ].filter(Boolean);
          return modifiers.reduce(function(acc, modifier) {
            return modifier(acc);
          }, createBaseRelation());
        } else {
          var modifiers = args;
          return modifiers.reduce(function(acc, modifier) {
            return modifier(acc);
          }, createBaseRelation());
        }
      }
      exports.$wildcard = Symbol.for("bitecs-wildcard");
      function createWildcardRelation() {
        var relation = createBaseRelation();
        Object.defineProperty(relation, exports.$wildcard, {
          value: true,
          enumerable: false,
          writable: false,
          configurable: false
        });
        return relation;
      }
      function getWildcard() {
        var GLOBAL_WILDCARD = Symbol.for("bitecs-global-wildcard");
        if (!globalThis[GLOBAL_WILDCARD]) {
          globalThis[GLOBAL_WILDCARD] = createWildcardRelation();
        }
        return globalThis[GLOBAL_WILDCARD];
      }
      exports.Wildcard = getWildcard();
      function createIsARelation() {
        return createBaseRelation();
      }
      function getIsA() {
        var GLOBAL_ISA = Symbol.for("bitecs-global-isa");
        if (!globalThis[GLOBAL_ISA]) {
          globalThis[GLOBAL_ISA] = createIsARelation();
        }
        return globalThis[GLOBAL_ISA];
      }
      exports.IsA = getIsA();
      function isWildcard(relation) {
        if (!relation)
          return false;
        var symbols = Object.getOwnPropertySymbols(relation);
        return symbols.includes(exports.$wildcard);
      }
      function isRelation(component) {
        if (!component)
          return false;
        var symbols = Object.getOwnPropertySymbols(component);
        return symbols.includes(exports.$relationData);
      }
    }
  });

  // dist/es5/core/Hierarchy.js
  var require_Hierarchy = __commonJS({
    "dist/es5/core/Hierarchy.js"(exports) {
      "use strict";
      var __values = exports && exports.__values || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
          next: function() {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
          }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
      };
      var __read = exports && exports.__read || function(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        } catch (error) {
          e = { error };
        } finally {
          try {
            if (r && !r.done && (m = i["return"])) m.call(i);
          } finally {
            if (e) throw e.error;
          }
        }
        return ar;
      };
      var __spreadArray = exports && exports.__spreadArray || function(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
          if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
          }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ensureDepthTracking = ensureDepthTracking;
      exports.calculateEntityDepth = calculateEntityDepth;
      exports.markChildrenDirty = markChildrenDirty;
      exports.updateHierarchyDepth = updateHierarchyDepth;
      exports.invalidateHierarchyDepth = invalidateHierarchyDepth;
      exports.flushDirtyDepths = flushDirtyDepths;
      exports.queryHierarchy = queryHierarchy;
      exports.queryHierarchyDepth = queryHierarchyDepth;
      exports.getHierarchyDepth = getHierarchyDepth;
      exports.getMaxHierarchyDepth = getMaxHierarchyDepth;
      var World_1 = require_World();
      var Relation_1 = require_Relation();
      var Query_1 = require_Query();
      var SparseSet_1 = require_SparseSet();
      var MAX_HIERARCHY_DEPTH = 64;
      var INVALID_DEPTH = 4294967295;
      var DEFAULT_BUFFER_GROWTH = 1024;
      function growDepthsArray(hierarchyData, entity) {
        var depths = hierarchyData.depths;
        if (entity < depths.length)
          return depths;
        var newSize = Math.max(entity + 1, depths.length * 2, depths.length + DEFAULT_BUFFER_GROWTH);
        var newDepths = new Uint32Array(newSize);
        newDepths.fill(INVALID_DEPTH);
        newDepths.set(depths);
        hierarchyData.depths = newDepths;
        return newDepths;
      }
      function updateDepthCache(hierarchyData, entity, newDepth, oldDepth) {
        var depthToEntities = hierarchyData.depthToEntities;
        if (oldDepth !== void 0 && oldDepth !== INVALID_DEPTH) {
          var oldSet = depthToEntities.get(oldDepth);
          if (oldSet) {
            oldSet.remove(entity);
            if (oldSet.dense.length === 0)
              depthToEntities.delete(oldDepth);
          }
        }
        if (newDepth !== INVALID_DEPTH) {
          if (!depthToEntities.has(newDepth))
            depthToEntities.set(newDepth, (0, SparseSet_1.createUint32SparseSet)());
          depthToEntities.get(newDepth).add(entity);
        }
      }
      function updateMaxDepth(hierarchyData, depth) {
        if (depth > hierarchyData.maxDepth) {
          hierarchyData.maxDepth = depth;
        }
      }
      function setEntityDepth(hierarchyData, entity, newDepth, oldDepth) {
        hierarchyData.depths[entity] = newDepth;
        updateDepthCache(hierarchyData, entity, newDepth, oldDepth);
        updateMaxDepth(hierarchyData, newDepth);
      }
      function invalidateQueryCache(world, relation) {
        var ctx = world[World_1.$internal];
        ctx.hierarchyQueryCache.delete(relation);
      }
      function getHierarchyData(world, relation) {
        var ctx = world[World_1.$internal];
        if (!ctx.hierarchyActiveRelations.has(relation)) {
          ctx.hierarchyActiveRelations.add(relation);
          ensureDepthTracking(world, relation);
          populateExistingDepths(world, relation);
        }
        return ctx.hierarchyData.get(relation);
      }
      function populateExistingDepths(world, relation) {
        var e_1, _a, e_2, _b, e_3, _c;
        var entitiesWithRelation = (0, Query_1.query)(world, [(0, Relation_1.Pair)(relation, Relation_1.Wildcard)]);
        try {
          for (var entitiesWithRelation_1 = __values(entitiesWithRelation), entitiesWithRelation_1_1 = entitiesWithRelation_1.next(); !entitiesWithRelation_1_1.done; entitiesWithRelation_1_1 = entitiesWithRelation_1.next()) {
            var entity = entitiesWithRelation_1_1.value;
            getEntityDepth(world, relation, entity);
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (entitiesWithRelation_1_1 && !entitiesWithRelation_1_1.done && (_a = entitiesWithRelation_1.return)) _a.call(entitiesWithRelation_1);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
        var processedTargets = /* @__PURE__ */ new Set();
        try {
          for (var entitiesWithRelation_2 = __values(entitiesWithRelation), entitiesWithRelation_2_1 = entitiesWithRelation_2.next(); !entitiesWithRelation_2_1.done; entitiesWithRelation_2_1 = entitiesWithRelation_2.next()) {
            var entity = entitiesWithRelation_2_1.value;
            try {
              for (var _d = (e_3 = void 0, __values((0, Relation_1.getRelationTargets)(world, entity, relation))), _e = _d.next(); !_e.done; _e = _d.next()) {
                var target = _e.value;
                if (!processedTargets.has(target)) {
                  processedTargets.add(target);
                  getEntityDepth(world, relation, target);
                }
              }
            } catch (e_3_1) {
              e_3 = { error: e_3_1 };
            } finally {
              try {
                if (_e && !_e.done && (_c = _d.return)) _c.call(_d);
              } finally {
                if (e_3) throw e_3.error;
              }
            }
          }
        } catch (e_2_1) {
          e_2 = { error: e_2_1 };
        } finally {
          try {
            if (entitiesWithRelation_2_1 && !entitiesWithRelation_2_1.done && (_b = entitiesWithRelation_2.return)) _b.call(entitiesWithRelation_2);
          } finally {
            if (e_2) throw e_2.error;
          }
        }
      }
      function ensureDepthTracking(world, relation) {
        var ctx = world[World_1.$internal];
        if (!ctx.hierarchyData.has(relation)) {
          var initialSize = Math.max(DEFAULT_BUFFER_GROWTH, ctx.entityIndex.dense.length * 2);
          var depthArray = new Uint32Array(initialSize);
          depthArray.fill(INVALID_DEPTH);
          ctx.hierarchyData.set(relation, {
            depths: depthArray,
            dirty: (0, SparseSet_1.createSparseSet)(),
            depthToEntities: /* @__PURE__ */ new Map(),
            maxDepth: 0
          });
        }
      }
      function calculateEntityDepth(world, relation, entity, visited) {
        var e_4, _a;
        if (visited === void 0) {
          visited = /* @__PURE__ */ new Set();
        }
        if (visited.has(entity))
          return 0;
        visited.add(entity);
        var targets = (0, Relation_1.getRelationTargets)(world, entity, relation);
        if (targets.length === 0)
          return 0;
        if (targets.length === 1)
          return getEntityDepthWithVisited(world, relation, targets[0], visited) + 1;
        var minDepth = Infinity;
        try {
          for (var targets_1 = __values(targets), targets_1_1 = targets_1.next(); !targets_1_1.done; targets_1_1 = targets_1.next()) {
            var target = targets_1_1.value;
            var depth = getEntityDepthWithVisited(world, relation, target, visited);
            if (depth < minDepth) {
              minDepth = depth;
              if (minDepth === 0)
                break;
            }
          }
        } catch (e_4_1) {
          e_4 = { error: e_4_1 };
        } finally {
          try {
            if (targets_1_1 && !targets_1_1.done && (_a = targets_1.return)) _a.call(targets_1);
          } finally {
            if (e_4) throw e_4.error;
          }
        }
        return minDepth === Infinity ? 0 : minDepth + 1;
      }
      function getEntityDepthWithVisited(world, relation, entity, visited) {
        var ctx = world[World_1.$internal];
        ensureDepthTracking(world, relation);
        var hierarchyData = ctx.hierarchyData.get(relation);
        var depths = hierarchyData.depths;
        depths = growDepthsArray(hierarchyData, entity);
        if (depths[entity] === INVALID_DEPTH) {
          var depth = calculateEntityDepth(world, relation, entity, visited);
          setEntityDepth(hierarchyData, entity, depth);
          return depth;
        }
        return depths[entity];
      }
      function getEntityDepth(world, relation, entity) {
        return getEntityDepthWithVisited(world, relation, entity, /* @__PURE__ */ new Set());
      }
      function markChildrenDirty(world, relation, parent, dirty, visited) {
        var e_5, _a;
        if (visited === void 0) {
          visited = (0, SparseSet_1.createSparseSet)();
        }
        if (visited.has(parent))
          return;
        visited.add(parent);
        var children = (0, Query_1.query)(world, [relation(parent)]);
        try {
          for (var children_1 = __values(children), children_1_1 = children_1.next(); !children_1_1.done; children_1_1 = children_1.next()) {
            var child = children_1_1.value;
            dirty.add(child);
            markChildrenDirty(world, relation, child, dirty, visited);
          }
        } catch (e_5_1) {
          e_5 = { error: e_5_1 };
        } finally {
          try {
            if (children_1_1 && !children_1_1.done && (_a = children_1.return)) _a.call(children_1);
          } finally {
            if (e_5) throw e_5.error;
          }
        }
      }
      function updateHierarchyDepth(world, relation, entity, parent, updating) {
        if (updating === void 0) {
          updating = /* @__PURE__ */ new Set();
        }
        var ctx = world[World_1.$internal];
        if (!ctx.hierarchyActiveRelations.has(relation)) {
          return;
        }
        ensureDepthTracking(world, relation);
        var hierarchyData = ctx.hierarchyData.get(relation);
        if (updating.has(entity)) {
          hierarchyData.dirty.add(entity);
          return;
        }
        updating.add(entity);
        var depths = hierarchyData.depths, dirty = hierarchyData.dirty;
        var newDepth = parent !== void 0 ? getEntityDepth(world, relation, parent) + 1 : 0;
        if (newDepth > MAX_HIERARCHY_DEPTH) {
          return;
        }
        var oldDepth = depths[entity];
        setEntityDepth(hierarchyData, entity, newDepth, oldDepth === INVALID_DEPTH ? void 0 : oldDepth);
        if (oldDepth !== newDepth) {
          markChildrenDirty(world, relation, entity, dirty, (0, SparseSet_1.createSparseSet)());
          invalidateQueryCache(world, relation);
        }
      }
      function invalidateHierarchyDepth(world, relation, entity) {
        var ctx = world[World_1.$internal];
        if (!ctx.hierarchyActiveRelations.has(relation)) {
          return;
        }
        var hierarchyData = ctx.hierarchyData.get(relation);
        var depths = hierarchyData.depths;
        depths = growDepthsArray(hierarchyData, entity);
        invalidateSubtree(world, relation, entity, depths, (0, SparseSet_1.createSparseSet)());
        invalidateQueryCache(world, relation);
      }
      function invalidateSubtree(world, relation, entity, depths, visited) {
        var e_6, _a;
        if (visited.has(entity))
          return;
        visited.add(entity);
        var ctx = world[World_1.$internal];
        var hierarchyData = ctx.hierarchyData.get(relation);
        if (entity < depths.length) {
          var oldDepth = depths[entity];
          if (oldDepth !== INVALID_DEPTH) {
            hierarchyData.depths[entity] = INVALID_DEPTH;
            updateDepthCache(hierarchyData, entity, INVALID_DEPTH, oldDepth);
          }
        }
        var children = (0, Query_1.query)(world, [relation(entity)]);
        try {
          for (var children_2 = __values(children), children_2_1 = children_2.next(); !children_2_1.done; children_2_1 = children_2.next()) {
            var child = children_2_1.value;
            invalidateSubtree(world, relation, child, depths, visited);
          }
        } catch (e_6_1) {
          e_6 = { error: e_6_1 };
        } finally {
          try {
            if (children_2_1 && !children_2_1.done && (_a = children_2.return)) _a.call(children_2);
          } finally {
            if (e_6) throw e_6.error;
          }
        }
      }
      function flushDirtyDepths(world, relation) {
        var e_7, _a;
        var ctx = world[World_1.$internal];
        var hierarchyData = ctx.hierarchyData.get(relation);
        if (!hierarchyData)
          return;
        var dirty = hierarchyData.dirty, depths = hierarchyData.depths;
        if (dirty.dense.length === 0)
          return;
        try {
          for (var _b = __values(dirty.dense), _c = _b.next(); !_c.done; _c = _b.next()) {
            var entity = _c.value;
            if (depths[entity] === INVALID_DEPTH) {
              var newDepth = calculateEntityDepth(world, relation, entity);
              setEntityDepth(hierarchyData, entity, newDepth);
            }
          }
        } catch (e_7_1) {
          e_7 = { error: e_7_1 };
        } finally {
          try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
          } finally {
            if (e_7) throw e_7.error;
          }
        }
        dirty.reset();
      }
      function queryHierarchy(world, relation, components, options) {
        if (options === void 0) {
          options = {};
        }
        var ctx = world[World_1.$internal];
        getHierarchyData(world, relation);
        var queryKey = (0, Query_1.queryHash)(world, __spreadArray([relation], __read(components), false));
        var cached = ctx.hierarchyQueryCache.get(relation);
        if (cached && cached.hash === queryKey) {
          return cached.result;
        }
        flushDirtyDepths(world, relation);
        (0, Query_1.queryInternal)(world, components, options);
        var queryObj = ctx.queriesHashMap.get((0, Query_1.queryHash)(world, components));
        var hierarchyData = ctx.hierarchyData.get(relation);
        var depths = hierarchyData.depths;
        queryObj.sort(function(a, b) {
          var depthA = depths[a];
          var depthB = depths[b];
          return depthA !== depthB ? depthA - depthB : a - b;
        });
        var result = options.buffered ? queryObj.dense : queryObj.dense;
        ctx.hierarchyQueryCache.set(relation, { hash: queryKey, result });
        return result;
      }
      function queryHierarchyDepth(world, relation, depth, options) {
        if (options === void 0) {
          options = {};
        }
        var hierarchyData = getHierarchyData(world, relation);
        flushDirtyDepths(world, relation);
        var entitiesAtDepth = hierarchyData.depthToEntities.get(depth);
        if (entitiesAtDepth) {
          return options.buffered ? entitiesAtDepth.dense : entitiesAtDepth.dense;
        }
        return options.buffered ? new Uint32Array(0) : [];
      }
      function getHierarchyDepth(world, entity, relation) {
        getHierarchyData(world, relation);
        return getEntityDepthWithVisited(world, relation, entity, /* @__PURE__ */ new Set());
      }
      function getMaxHierarchyDepth(world, relation) {
        var hierarchyData = getHierarchyData(world, relation);
        return hierarchyData.maxDepth;
      }
    }
  });

  // dist/es5/core/Query.js
  var require_Query = __commonJS({
    "dist/es5/core/Query.js"(exports) {
      "use strict";
      var __read = exports && exports.__read || function(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        } catch (error) {
          e = { error };
        } finally {
          try {
            if (r && !r.done && (m = i["return"])) m.call(i);
          } finally {
            if (e) throw e.error;
          }
        }
        return ar;
      };
      var __spreadArray = exports && exports.__spreadArray || function(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
          if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
          }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
      };
      var __values = exports && exports.__values || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
          next: function() {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
          }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
      };
      var _a;
      var _b;
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.removeQuery = exports.queryRemoveEntity = exports.commitRemovals = exports.queryAddEntity = exports.queryCheckComponent = exports.registerQuery = exports.queryHash = exports.onGet = exports.onSet = exports.onRemove = exports.onAdd = exports.noCommit = exports.isNested = exports.asBuffer = exports.$modifierType = exports.Cascade = exports.Hierarchy = exports.$hierarchyDepth = exports.$hierarchyRel = exports.$hierarchyType = exports.None = exports.All = exports.Any = exports.Not = exports.And = exports.Or = exports.$opTerms = exports.$opType = void 0;
      exports.observe = observe;
      exports.queryInternal = queryInternal;
      exports.query = query;
      exports.queryCheckEntity = queryCheckEntity;
      var SparseSet_1 = require_SparseSet();
      var Component_1 = require_Component();
      var World_1 = require_World();
      var Observer_1 = require_Observer();
      var Entity_1 = require_Entity();
      var Hierarchy_1 = require_Hierarchy();
      exports.$opType = Symbol.for("bitecs-opType");
      exports.$opTerms = Symbol.for("bitecs-opTerms");
      var createOp = function(type) {
        return function() {
          var _a2;
          var components = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            components[_i] = arguments[_i];
          }
          return _a2 = {}, _a2[exports.$opType] = type, _a2[exports.$opTerms] = components, _a2;
        };
      };
      exports.Or = createOp("Or");
      exports.And = createOp("And");
      exports.Not = createOp("Not");
      exports.Any = exports.Or;
      exports.All = exports.And;
      exports.None = exports.Not;
      exports.$hierarchyType = Symbol.for("bitecs-hierarchyType");
      exports.$hierarchyRel = Symbol.for("bitecs-hierarchyRel");
      exports.$hierarchyDepth = Symbol.for("bitecs-hierarchyDepth");
      var Hierarchy = function(relation, depth) {
        var _a2;
        return _a2 = {}, _a2[exports.$hierarchyType] = "Hierarchy", _a2[exports.$hierarchyRel] = relation, _a2[exports.$hierarchyDepth] = depth, _a2;
      };
      exports.Hierarchy = Hierarchy;
      exports.Cascade = exports.Hierarchy;
      exports.$modifierType = Symbol.for("bitecs-modifierType");
      exports.asBuffer = (_a = {}, _a[exports.$modifierType] = "buffer", _a);
      exports.isNested = (_b = {}, _b[exports.$modifierType] = "nested", _b);
      exports.noCommit = exports.isNested;
      var createHook = function(type) {
        return function() {
          var _a2;
          var terms = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            terms[_i] = arguments[_i];
          }
          return _a2 = {}, _a2[exports.$opType] = type, _a2[exports.$opTerms] = terms, _a2;
        };
      };
      exports.onAdd = createHook("add");
      exports.onRemove = createHook("remove");
      var onSet = function(component) {
        var _a2;
        return _a2 = {}, _a2[exports.$opType] = "set", _a2[exports.$opTerms] = [component], _a2;
      };
      exports.onSet = onSet;
      var onGet = function(component) {
        var _a2;
        return _a2 = {}, _a2[exports.$opType] = "get", _a2[exports.$opTerms] = [component], _a2;
      };
      exports.onGet = onGet;
      function observe(world, hook, callback) {
        var ctx = world[World_1.$internal];
        var _a2 = hook, _b2 = exports.$opType, type = _a2[_b2], _c = exports.$opTerms, components = _a2[_c];
        if (type === "add" || type === "remove") {
          var queryData = ctx.queriesHashMap.get((0, exports.queryHash)(world, components)) || (0, exports.registerQuery)(world, components);
          return queryData[type === "add" ? "addObservable" : "removeObservable"].subscribe(callback);
        }
        if (type === "set" || type === "get") {
          if (components.length !== 1)
            throw new Error("Set and Get hooks can only observe a single component");
          var componentData = ctx.componentMap.get(components[0]) || (0, Component_1.registerComponent)(world, components[0]);
          return componentData[type === "set" ? "setObservable" : "getObservable"].subscribe(callback);
        }
        throw new Error("Invalid hook type: ".concat(type));
      }
      var queryHash = function(world, terms) {
        var ctx = world[World_1.$internal];
        var getComponentId = function(component) {
          if (!ctx.componentMap.has(component))
            (0, Component_1.registerComponent)(world, component);
          return ctx.componentMap.get(component).id;
        };
        var termToString = function(term) {
          return exports.$opType in term ? "".concat(term[exports.$opType].toLowerCase(), "(").concat(term[exports.$opTerms].map(termToString).sort().join(","), ")") : getComponentId(term).toString();
        };
        return terms.map(termToString).sort().join("-");
      };
      exports.queryHash = queryHash;
      var registerQuery = function(world, terms, options) {
        if (options === void 0) {
          options = {};
        }
        var ctx = world[World_1.$internal];
        var hash = (0, exports.queryHash)(world, terms);
        var queryComponents = [];
        var collect = function(term) {
          if (exports.$opType in term)
            term[exports.$opTerms].forEach(collect);
          else {
            if (!ctx.componentMap.has(term))
              (0, Component_1.registerComponent)(world, term);
            queryComponents.push(term);
          }
        };
        terms.forEach(collect);
        var components = [];
        var notComponents = [];
        var orComponents = [];
        var addToArray = function(arr, comps) {
          comps.forEach(function(comp) {
            if (!ctx.componentMap.has(comp))
              (0, Component_1.registerComponent)(world, comp);
            arr.push(comp);
          });
        };
        terms.forEach(function(term) {
          if (exports.$opType in term) {
            var _a2 = term, _b2 = exports.$opType, type = _a2[_b2], _c = exports.$opTerms, comps = _a2[_c];
            if (type === "Not")
              addToArray(notComponents, comps);
            else if (type === "Or")
              addToArray(orComponents, comps);
            else if (type === "And")
              addToArray(components, comps);
            else
              throw new Error("Nested combinator ".concat(type, " not supported yet - use simple queries for best performance"));
          } else {
            if (!ctx.componentMap.has(term))
              (0, Component_1.registerComponent)(world, term);
            components.push(term);
          }
        });
        var allComponentsData = queryComponents.map(function(c) {
          return ctx.componentMap.get(c);
        });
        var generations = __spreadArray([], __read(new Set(allComponentsData.map(function(c) {
          return c.generationId;
        }))), false);
        var reduceBitflags = function(a, c) {
          return a[c.generationId] = (a[c.generationId] || 0) | c.bitflag, a;
        };
        var masks = components.map(function(c) {
          return ctx.componentMap.get(c);
        }).reduce(reduceBitflags, {});
        var notMasks = notComponents.map(function(c) {
          return ctx.componentMap.get(c);
        }).reduce(reduceBitflags, {});
        var orMasks = orComponents.map(function(c) {
          return ctx.componentMap.get(c);
        }).reduce(reduceBitflags, {});
        var hasMasks = allComponentsData.reduce(reduceBitflags, {});
        var query2 = Object.assign(options.buffered ? (0, SparseSet_1.createUint32SparseSet)() : (0, SparseSet_1.createSparseSet)(), {
          allComponents: queryComponents,
          orComponents,
          notComponents,
          masks,
          notMasks,
          orMasks,
          hasMasks,
          generations,
          toRemove: (0, SparseSet_1.createSparseSet)(),
          addObservable: (0, Observer_1.createObservable)(),
          removeObservable: (0, Observer_1.createObservable)(),
          queues: {}
        });
        ctx.queries.add(query2);
        ctx.queriesHashMap.set(hash, query2);
        allComponentsData.forEach(function(c) {
          c.queries.add(query2);
        });
        if (notComponents.length)
          ctx.notQueries.add(query2);
        var entityIndex = ctx.entityIndex;
        for (var i = 0; i < entityIndex.aliveCount; i++) {
          var eid = entityIndex.dense[i];
          if ((0, Component_1.hasComponent)(world, eid, Entity_1.Prefab))
            continue;
          var match = queryCheckEntity(world, query2, eid);
          if (match) {
            (0, exports.queryAddEntity)(query2, eid);
          }
        }
        return query2;
      };
      exports.registerQuery = registerQuery;
      function queryInternal(world, terms, options) {
        if (options === void 0) {
          options = {};
        }
        var ctx = world[World_1.$internal];
        var hash = (0, exports.queryHash)(world, terms);
        var queryData = ctx.queriesHashMap.get(hash);
        if (!queryData) {
          queryData = (0, exports.registerQuery)(world, terms, options);
        } else if (options.buffered && !("buffer" in queryData.dense)) {
          queryData = (0, exports.registerQuery)(world, terms, { buffered: true });
        }
        return options.buffered ? queryData.dense : queryData.dense;
      }
      function query(world, terms) {
        var e_1, _a2;
        var modifiers = [];
        for (var _i = 2; _i < arguments.length; _i++) {
          modifiers[_i - 2] = arguments[_i];
        }
        var hierarchyTerm = terms.find(function(term) {
          return term && typeof term === "object" && exports.$hierarchyType in term;
        });
        var regularTerms = terms.filter(function(term) {
          return !(term && typeof term === "object" && exports.$hierarchyType in term);
        });
        var buffered = false, commit = true;
        var hasModifiers = modifiers.some(function(m) {
          return m && typeof m === "object" && exports.$modifierType in m;
        });
        try {
          for (var modifiers_1 = __values(modifiers), modifiers_1_1 = modifiers_1.next(); !modifiers_1_1.done; modifiers_1_1 = modifiers_1.next()) {
            var modifier = modifiers_1_1.value;
            if (hasModifiers && modifier && typeof modifier === "object" && exports.$modifierType in modifier) {
              var mod = modifier;
              if (mod[exports.$modifierType] === "buffer")
                buffered = true;
              if (mod[exports.$modifierType] === "nested")
                commit = false;
            } else if (!hasModifiers) {
              var opts = modifier;
              if (opts.buffered !== void 0)
                buffered = opts.buffered;
              if (opts.commit !== void 0)
                commit = opts.commit;
            }
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (modifiers_1_1 && !modifiers_1_1.done && (_a2 = modifiers_1.return)) _a2.call(modifiers_1);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
        if (hierarchyTerm) {
          var _b2 = hierarchyTerm, _c = exports.$hierarchyRel, relation = _b2[_c], _d = exports.$hierarchyDepth, depth = _b2[_d];
          return depth !== void 0 ? (0, Hierarchy_1.queryHierarchyDepth)(world, relation, depth, { buffered }) : (0, Hierarchy_1.queryHierarchy)(world, relation, regularTerms, { buffered });
        }
        if (commit)
          (0, exports.commitRemovals)(world);
        return queryInternal(world, regularTerms, { buffered });
      }
      function queryCheckEntity(world, query2, eid) {
        var ctx = world[World_1.$internal];
        var masks = query2.masks, notMasks = query2.notMasks, orMasks = query2.orMasks, generations = query2.generations;
        var hasOrMatch = Object.keys(orMasks).length === 0;
        for (var i = 0; i < generations.length; i++) {
          var generationId = generations[i];
          var qMask = masks[generationId];
          var qNotMask = notMasks[generationId];
          var qOrMask = orMasks[generationId];
          var eMask = ctx.entityMasks[generationId][eid];
          if (qNotMask && (eMask & qNotMask) !== 0) {
            return false;
          }
          if (qMask && (eMask & qMask) !== qMask) {
            return false;
          }
          if (qOrMask && (eMask & qOrMask) !== 0) {
            hasOrMatch = true;
          }
        }
        return hasOrMatch;
      }
      var queryCheckComponent = function(query2, c) {
        var generationId = c.generationId, bitflag = c.bitflag;
        var hasMasks = query2.hasMasks;
        var mask = hasMasks[generationId];
        return (mask & bitflag) === bitflag;
      };
      exports.queryCheckComponent = queryCheckComponent;
      var queryAddEntity = function(query2, eid) {
        query2.toRemove.remove(eid);
        query2.addObservable.notify(eid);
        query2.add(eid);
      };
      exports.queryAddEntity = queryAddEntity;
      var queryCommitRemovals = function(query2) {
        for (var i = 0; i < query2.toRemove.dense.length; i++) {
          var eid = query2.toRemove.dense[i];
          query2.remove(eid);
        }
        query2.toRemove.reset();
      };
      var commitRemovals = function(world) {
        var ctx = world[World_1.$internal];
        if (!ctx.dirtyQueries.size)
          return;
        ctx.dirtyQueries.forEach(queryCommitRemovals);
        ctx.dirtyQueries.clear();
      };
      exports.commitRemovals = commitRemovals;
      var queryRemoveEntity = function(world, query2, eid) {
        var ctx = world[World_1.$internal];
        var has = query2.has(eid);
        if (!has || query2.toRemove.has(eid))
          return;
        query2.toRemove.add(eid);
        ctx.dirtyQueries.add(query2);
        query2.removeObservable.notify(eid);
      };
      exports.queryRemoveEntity = queryRemoveEntity;
      var removeQuery = function(world, terms) {
        var ctx = world[World_1.$internal];
        var hash = (0, exports.queryHash)(world, terms);
        var query2 = ctx.queriesHashMap.get(hash);
        if (query2) {
          ctx.queries.delete(query2);
          ctx.queriesHashMap.delete(hash);
        }
      };
      exports.removeQuery = removeQuery;
    }
  });

  // dist/es5/core/Component.js
  var require_Component = __commonJS({
    "dist/es5/core/Component.js"(exports) {
      "use strict";
      var __values = exports && exports.__values || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
          next: function() {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
          }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.removeComponents = exports.removeComponent = exports.addComponent = exports.setComponent = exports.set = exports.getComponent = exports.hasComponent = exports.registerComponents = exports.registerComponent = void 0;
      exports.addComponents = addComponents;
      var Entity_1 = require_Entity();
      var Query_1 = require_Query();
      var Relation_1 = require_Relation();
      var Observer_1 = require_Observer();
      var World_1 = require_World();
      var Hierarchy_1 = require_Hierarchy();
      var registerComponent = function(world, component) {
        if (!component) {
          throw new Error("bitECS - Cannot register null or undefined component");
        }
        var ctx = world[World_1.$internal];
        var queries = /* @__PURE__ */ new Set();
        var data = {
          id: ctx.componentCount++,
          generationId: ctx.entityMasks.length - 1,
          bitflag: ctx.bitflag,
          ref: component,
          queries,
          setObservable: (0, Observer_1.createObservable)(),
          getObservable: (0, Observer_1.createObservable)()
        };
        ctx.componentMap.set(component, data);
        ctx.bitflag *= 2;
        if (ctx.bitflag >= Math.pow(2, 31)) {
          ctx.bitflag = 1;
          ctx.entityMasks.push([]);
        }
        return data;
      };
      exports.registerComponent = registerComponent;
      var registerComponents = function(world, components) {
        components.forEach(function(component) {
          return (0, exports.registerComponent)(world, component);
        });
      };
      exports.registerComponents = registerComponents;
      var hasComponent = function(world, eid, component) {
        var ctx = world[World_1.$internal];
        var registeredComponent = ctx.componentMap.get(component);
        if (!registeredComponent)
          return false;
        var generationId = registeredComponent.generationId, bitflag = registeredComponent.bitflag;
        var mask = ctx.entityMasks[generationId][eid];
        return (mask & bitflag) === bitflag;
      };
      exports.hasComponent = hasComponent;
      var getComponent = function(world, eid, component) {
        var ctx = world[World_1.$internal];
        var componentData = ctx.componentMap.get(component);
        if (!componentData) {
          return void 0;
        }
        if (!(0, exports.hasComponent)(world, eid, component)) {
          return void 0;
        }
        return componentData.getObservable.notify(eid);
      };
      exports.getComponent = getComponent;
      var set = function(component, data) {
        return {
          component,
          data
        };
      };
      exports.set = set;
      var recursivelyInherit = function(ctx, world, baseEid, inheritedEid, visited) {
        var e_1, _a, e_2, _b;
        if (visited === void 0) {
          visited = /* @__PURE__ */ new Set();
        }
        if (visited.has(inheritedEid))
          return;
        visited.add(inheritedEid);
        (0, exports.addComponent)(world, baseEid, (0, Relation_1.IsA)(inheritedEid));
        try {
          for (var _c = __values((0, Entity_1.getEntityComponents)(world, inheritedEid)), _d = _c.next(); !_d.done; _d = _c.next()) {
            var component = _d.value;
            if (component === Entity_1.Prefab)
              continue;
            if (!(0, exports.hasComponent)(world, baseEid, component)) {
              (0, exports.addComponent)(world, baseEid, component);
              var componentData = ctx.componentMap.get(component);
              if (componentData === null || componentData === void 0 ? void 0 : componentData.setObservable) {
                var data = (0, exports.getComponent)(world, inheritedEid, component);
                componentData.setObservable.notify(baseEid, data);
              }
            }
          }
        } catch (e_1_1) {
          e_1 = { error: e_1_1 };
        } finally {
          try {
            if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
          } finally {
            if (e_1) throw e_1.error;
          }
        }
        try {
          for (var _e = __values((0, Relation_1.getRelationTargets)(world, inheritedEid, Relation_1.IsA)), _f = _e.next(); !_f.done; _f = _e.next()) {
            var parentEid = _f.value;
            recursivelyInherit(ctx, world, baseEid, parentEid, visited);
          }
        } catch (e_2_1) {
          e_2 = { error: e_2_1 };
        } finally {
          try {
            if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
          } finally {
            if (e_2) throw e_2.error;
          }
        }
      };
      var setComponent = function(world, eid, component, data) {
        (0, exports.addComponent)(world, eid, (0, exports.set)(component, data));
      };
      exports.setComponent = setComponent;
      var addComponent = function(world, eid, componentOrSet) {
        var e_3, _a;
        if (!(0, Entity_1.entityExists)(world, eid)) {
          throw new Error("Cannot add component - entity ".concat(eid, " does not exist in the world."));
        }
        var ctx = world[World_1.$internal];
        var component = "component" in componentOrSet ? componentOrSet.component : componentOrSet;
        var data = "data" in componentOrSet ? componentOrSet.data : void 0;
        if (!ctx.componentMap.has(component))
          (0, exports.registerComponent)(world, component);
        var componentData = ctx.componentMap.get(component);
        if ((0, exports.hasComponent)(world, eid, component)) {
          if (data !== void 0) {
            componentData.setObservable.notify(eid, data);
          }
          return false;
        }
        var generationId = componentData.generationId, bitflag = componentData.bitflag, queries = componentData.queries;
        ctx.entityMasks[generationId][eid] |= bitflag;
        if (!(0, exports.hasComponent)(world, eid, Entity_1.Prefab)) {
          queries.forEach(function(queryData) {
            queryData.toRemove.remove(eid);
            var match = (0, Query_1.queryCheckEntity)(world, queryData, eid);
            if (match)
              (0, Query_1.queryAddEntity)(queryData, eid);
            else
              (0, Query_1.queryRemoveEntity)(world, queryData, eid);
          });
        }
        ctx.entityComponents.get(eid).add(component);
        if (data !== void 0) {
          componentData.setObservable.notify(eid, data);
        }
        if (component[Relation_1.$isPairComponent]) {
          var relation = component[Relation_1.$relation];
          var target = component[Relation_1.$pairTarget];
          addComponents(world, eid, (0, Relation_1.Pair)(relation, Relation_1.Wildcard), (0, Relation_1.Pair)(Relation_1.Wildcard, target));
          if (typeof target === "number") {
            addComponents(world, target, (0, Relation_1.Pair)(Relation_1.Wildcard, eid), (0, Relation_1.Pair)(Relation_1.Wildcard, relation));
            ctx.entitiesWithRelations.add(target);
            ctx.entitiesWithRelations.add(eid);
          }
          ctx.entitiesWithRelations.add(target);
          var relationData = relation[Relation_1.$relationData];
          if (relationData.exclusiveRelation === true && target !== Relation_1.Wildcard) {
            var oldTarget = (0, Relation_1.getRelationTargets)(world, eid, relation)[0];
            if (oldTarget !== void 0 && oldTarget !== null && oldTarget !== target) {
              (0, exports.removeComponent)(world, eid, relation(oldTarget));
            }
          }
          if (relation === Relation_1.IsA) {
            var inheritedTargets = (0, Relation_1.getRelationTargets)(world, eid, Relation_1.IsA);
            try {
              for (var inheritedTargets_1 = __values(inheritedTargets), inheritedTargets_1_1 = inheritedTargets_1.next(); !inheritedTargets_1_1.done; inheritedTargets_1_1 = inheritedTargets_1.next()) {
                var inherited = inheritedTargets_1_1.value;
                recursivelyInherit(ctx, world, eid, inherited);
              }
            } catch (e_3_1) {
              e_3 = { error: e_3_1 };
            } finally {
              try {
                if (inheritedTargets_1_1 && !inheritedTargets_1_1.done && (_a = inheritedTargets_1.return)) _a.call(inheritedTargets_1);
              } finally {
                if (e_3) throw e_3.error;
              }
            }
          }
          (0, Hierarchy_1.updateHierarchyDepth)(world, relation, eid, typeof target === "number" ? target : void 0);
        }
        return true;
      };
      exports.addComponent = addComponent;
      function addComponents(world, eid) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
          args[_i - 2] = arguments[_i];
        }
        var components = Array.isArray(args[0]) ? args[0] : args;
        components.forEach(function(componentOrSet) {
          (0, exports.addComponent)(world, eid, componentOrSet);
        });
      }
      var removeComponent = function(world, eid) {
        var components = [];
        for (var _i = 2; _i < arguments.length; _i++) {
          components[_i - 2] = arguments[_i];
        }
        var ctx = world[World_1.$internal];
        if (!(0, Entity_1.entityExists)(world, eid)) {
          throw new Error("Cannot remove component - entity ".concat(eid, " does not exist in the world."));
        }
        components.forEach(function(component) {
          if (!(0, exports.hasComponent)(world, eid, component))
            return;
          var componentNode = ctx.componentMap.get(component);
          var generationId = componentNode.generationId, bitflag = componentNode.bitflag, queries = componentNode.queries;
          ctx.entityMasks[generationId][eid] &= ~bitflag;
          queries.forEach(function(queryData) {
            queryData.toRemove.remove(eid);
            var match = (0, Query_1.queryCheckEntity)(world, queryData, eid);
            if (match)
              (0, Query_1.queryAddEntity)(queryData, eid);
            else
              (0, Query_1.queryRemoveEntity)(world, queryData, eid);
          });
          ctx.entityComponents.get(eid).delete(component);
          if (component[Relation_1.$isPairComponent]) {
            var target = component[Relation_1.$pairTarget];
            var relation = component[Relation_1.$relation];
            (0, Hierarchy_1.invalidateHierarchyDepth)(world, relation, eid);
            (0, exports.removeComponent)(world, eid, (0, Relation_1.Pair)(Relation_1.Wildcard, target));
            if (typeof target === "number" && (0, Entity_1.entityExists)(world, target)) {
              (0, exports.removeComponent)(world, target, (0, Relation_1.Pair)(Relation_1.Wildcard, eid));
              (0, exports.removeComponent)(world, target, (0, Relation_1.Pair)(Relation_1.Wildcard, relation));
            }
            var otherTargets = (0, Relation_1.getRelationTargets)(world, eid, relation);
            if (otherTargets.length === 0) {
              (0, exports.removeComponent)(world, eid, (0, Relation_1.Pair)(relation, Relation_1.Wildcard));
            }
          }
        });
      };
      exports.removeComponent = removeComponent;
      exports.removeComponents = exports.removeComponent;
    }
  });

  // dist/es5/core/Entity.js
  var require_Entity = __commonJS({
    "dist/es5/core/Entity.js"(exports) {
      "use strict";
      var __values = exports && exports.__values || function(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
          next: function() {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
          }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.entityExists = exports.getEntityComponents = exports.removeEntity = exports.addEntity = exports.addPrefab = exports.Prefab = void 0;
      var Component_1 = require_Component();
      var Query_1 = require_Query();
      var Relation_1 = require_Relation();
      var EntityIndex_1 = require_EntityIndex();
      var World_1 = require_World();
      exports.Prefab = {};
      var addPrefab = function(world) {
        var eid = (0, exports.addEntity)(world);
        (0, Component_1.addComponent)(world, eid, exports.Prefab);
        return eid;
      };
      exports.addPrefab = addPrefab;
      var addEntity = function(world) {
        var ctx = world[World_1.$internal];
        var eid = (0, EntityIndex_1.addEntityId)(ctx.entityIndex);
        ctx.notQueries.forEach(function(q) {
          var match = (0, Query_1.queryCheckEntity)(world, q, eid);
          if (match)
            (0, Query_1.queryAddEntity)(q, eid);
        });
        ctx.entityComponents.set(eid, /* @__PURE__ */ new Set());
        return eid;
      };
      exports.addEntity = addEntity;
      var removeEntity = function(world, eid) {
        var ctx = world[World_1.$internal];
        if (!(0, EntityIndex_1.isEntityIdAlive)(ctx.entityIndex, eid))
          return;
        var removalQueue = [eid];
        var processedEntities = /* @__PURE__ */ new Set();
        var _loop_1 = function() {
          var e_1, _a, e_2, _b, e_3, _c, e_4, _d;
          var currentEid = removalQueue.shift();
          if (processedEntities.has(currentEid))
            return "continue";
          processedEntities.add(currentEid);
          var componentRemovalQueue = [];
          if (ctx.entitiesWithRelations.has(currentEid)) {
            var _loop_2 = function(subject2) {
              var e_5, _j;
              if (!(0, exports.entityExists)(world, subject2)) {
                return "continue";
              }
              var _loop_3 = function(component2) {
                if (!component2[Relation_1.$isPairComponent]) {
                  return "continue";
                }
                var relation = component2[Relation_1.$relation];
                var relationData = relation[Relation_1.$relationData];
                componentRemovalQueue.push(function() {
                  return (0, Component_1.removeComponent)(world, subject2, (0, Relation_1.Pair)(Relation_1.Wildcard, currentEid));
                });
                if (component2[Relation_1.$pairTarget] === currentEid) {
                  componentRemovalQueue.push(function() {
                    return (0, Component_1.removeComponent)(world, subject2, component2);
                  });
                  if (relationData.autoRemoveSubject) {
                    removalQueue.push(subject2);
                  }
                  if (relationData.onTargetRemoved) {
                    componentRemovalQueue.push(function() {
                      return relationData.onTargetRemoved(world, subject2, currentEid);
                    });
                  }
                }
              };
              try {
                for (var _k = (e_5 = void 0, __values(ctx.entityComponents.get(subject2))), _l = _k.next(); !_l.done; _l = _k.next()) {
                  var component = _l.value;
                  _loop_3(component);
                }
              } catch (e_5_1) {
                e_5 = { error: e_5_1 };
              } finally {
                try {
                  if (_l && !_l.done && (_j = _k.return)) _j.call(_k);
                } finally {
                  if (e_5) throw e_5.error;
                }
              }
            };
            try {
              for (var _e = (e_1 = void 0, __values((0, Query_1.query)(world, [(0, Relation_1.Wildcard)(currentEid)], Query_1.noCommit))), _f = _e.next(); !_f.done; _f = _e.next()) {
                var subject = _f.value;
                _loop_2(subject);
              }
            } catch (e_1_1) {
              e_1 = { error: e_1_1 };
            } finally {
              try {
                if (_f && !_f.done && (_a = _e.return)) _a.call(_e);
              } finally {
                if (e_1) throw e_1.error;
              }
            }
            ctx.entitiesWithRelations.delete(currentEid);
          }
          try {
            for (var componentRemovalQueue_1 = (e_2 = void 0, __values(componentRemovalQueue)), componentRemovalQueue_1_1 = componentRemovalQueue_1.next(); !componentRemovalQueue_1_1.done; componentRemovalQueue_1_1 = componentRemovalQueue_1.next()) {
              var removeOperation = componentRemovalQueue_1_1.value;
              removeOperation();
            }
          } catch (e_2_1) {
            e_2 = { error: e_2_1 };
          } finally {
            try {
              if (componentRemovalQueue_1_1 && !componentRemovalQueue_1_1.done && (_b = componentRemovalQueue_1.return)) _b.call(componentRemovalQueue_1);
            } finally {
              if (e_2) throw e_2.error;
            }
          }
          try {
            for (var removalQueue_1 = (e_3 = void 0, __values(removalQueue)), removalQueue_1_1 = removalQueue_1.next(); !removalQueue_1_1.done; removalQueue_1_1 = removalQueue_1.next()) {
              var eid_1 = removalQueue_1_1.value;
              (0, exports.removeEntity)(world, eid_1);
            }
          } catch (e_3_1) {
            e_3 = { error: e_3_1 };
          } finally {
            try {
              if (removalQueue_1_1 && !removalQueue_1_1.done && (_c = removalQueue_1.return)) _c.call(removalQueue_1);
            } finally {
              if (e_3) throw e_3.error;
            }
          }
          try {
            for (var _g = (e_4 = void 0, __values(ctx.queries)), _h = _g.next(); !_h.done; _h = _g.next()) {
              var query_1 = _h.value;
              (0, Query_1.queryRemoveEntity)(world, query_1, currentEid);
            }
          } catch (e_4_1) {
            e_4 = { error: e_4_1 };
          } finally {
            try {
              if (_h && !_h.done && (_d = _g.return)) _d.call(_g);
            } finally {
              if (e_4) throw e_4.error;
            }
          }
          (0, EntityIndex_1.removeEntityId)(ctx.entityIndex, currentEid);
          ctx.entityComponents.delete(currentEid);
          for (var i = 0; i < ctx.entityMasks.length; i++) {
            ctx.entityMasks[i][currentEid] = 0;
          }
        };
        while (removalQueue.length > 0) {
          _loop_1();
        }
      };
      exports.removeEntity = removeEntity;
      var getEntityComponents = function(world, eid) {
        var ctx = world[World_1.$internal];
        if (eid === void 0)
          throw new Error("getEntityComponents: entity id is undefined.");
        if (!(0, EntityIndex_1.isEntityIdAlive)(ctx.entityIndex, eid))
          throw new Error("getEntityComponents: entity ".concat(eid, " does not exist in the world."));
        return Array.from(ctx.entityComponents.get(eid));
      };
      exports.getEntityComponents = getEntityComponents;
      var entityExists = function(world, eid) {
        return (0, EntityIndex_1.isEntityIdAlive)(world[World_1.$internal].entityIndex, eid);
      };
      exports.entityExists = entityExists;
    }
  });

  // dist/es5/core/utils/pipe.js
  var require_pipe = __commonJS({
    "dist/es5/core/utils/pipe.js"(exports) {
      "use strict";
      var __read = exports && exports.__read || function(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
          while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        } catch (error) {
          e = { error };
        } finally {
          try {
            if (r && !r.done && (m = i["return"])) m.call(i);
          } finally {
            if (e) throw e.error;
          }
        }
        return ar;
      };
      var __spreadArray = exports && exports.__spreadArray || function(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
          if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
          }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.pipe = void 0;
      var pipe = function() {
        var functions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          functions[_i] = arguments[_i];
        }
        return function() {
          var args = [];
          for (var _i2 = 0; _i2 < arguments.length; _i2++) {
            args[_i2] = arguments[_i2];
          }
          return functions.reduce(function(result, fn) {
            return [fn.apply(void 0, __spreadArray([], __read(result), false))];
          }, args)[0];
        };
      };
      exports.pipe = pipe;
    }
  });

  // dist/es5/core/index.js
  var require_core = __commonJS({
    "dist/es5/core/index.js"(exports) {
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.withStore = exports.withOnTargetRemoved = exports.withAutoRemoveSubject = exports.pipe = exports.noCommit = exports.isNested = exports.asBuffer = exports.Cascade = exports.Hierarchy = exports.onSet = exports.onGet = exports.None = exports.All = exports.Any = exports.Not = exports.And = exports.Or = exports.onRemove = exports.onAdd = exports.observe = exports.query = exports.registerQuery = exports.removeQuery = exports.commitRemovals = exports.set = exports.getComponent = exports.removeComponents = exports.removeComponent = exports.setComponent = exports.addComponents = exports.addComponent = exports.hasComponent = exports.registerComponents = exports.registerComponent = exports.withVersioning = exports.getVersion = exports.getId = exports.createEntityIndex = exports.addPrefab = exports.Prefab = exports.entityExists = exports.getEntityComponents = exports.removeEntity = exports.addEntity = exports.$internal = exports.getAllEntities = exports.getWorldComponents = exports.deleteWorld = exports.resetWorld = exports.createWorld = void 0;
      exports.getMaxHierarchyDepth = exports.getHierarchyDepth = exports.isWildcard = exports.isRelation = exports.Pair = exports.IsA = exports.Wildcard = exports.getRelationTargets = exports.createRelation = void 0;
      var World_1 = require_World();
      Object.defineProperty(exports, "createWorld", { enumerable: true, get: function() {
        return World_1.createWorld;
      } });
      Object.defineProperty(exports, "resetWorld", { enumerable: true, get: function() {
        return World_1.resetWorld;
      } });
      Object.defineProperty(exports, "deleteWorld", { enumerable: true, get: function() {
        return World_1.deleteWorld;
      } });
      Object.defineProperty(exports, "getWorldComponents", { enumerable: true, get: function() {
        return World_1.getWorldComponents;
      } });
      Object.defineProperty(exports, "getAllEntities", { enumerable: true, get: function() {
        return World_1.getAllEntities;
      } });
      Object.defineProperty(exports, "$internal", { enumerable: true, get: function() {
        return World_1.$internal;
      } });
      var Entity_1 = require_Entity();
      Object.defineProperty(exports, "addEntity", { enumerable: true, get: function() {
        return Entity_1.addEntity;
      } });
      Object.defineProperty(exports, "removeEntity", { enumerable: true, get: function() {
        return Entity_1.removeEntity;
      } });
      Object.defineProperty(exports, "getEntityComponents", { enumerable: true, get: function() {
        return Entity_1.getEntityComponents;
      } });
      Object.defineProperty(exports, "entityExists", { enumerable: true, get: function() {
        return Entity_1.entityExists;
      } });
      Object.defineProperty(exports, "Prefab", { enumerable: true, get: function() {
        return Entity_1.Prefab;
      } });
      Object.defineProperty(exports, "addPrefab", { enumerable: true, get: function() {
        return Entity_1.addPrefab;
      } });
      var EntityIndex_1 = require_EntityIndex();
      Object.defineProperty(exports, "createEntityIndex", { enumerable: true, get: function() {
        return EntityIndex_1.createEntityIndex;
      } });
      Object.defineProperty(exports, "getId", { enumerable: true, get: function() {
        return EntityIndex_1.getId;
      } });
      Object.defineProperty(exports, "getVersion", { enumerable: true, get: function() {
        return EntityIndex_1.getVersion;
      } });
      Object.defineProperty(exports, "withVersioning", { enumerable: true, get: function() {
        return EntityIndex_1.withVersioning;
      } });
      var Component_1 = require_Component();
      Object.defineProperty(exports, "registerComponent", { enumerable: true, get: function() {
        return Component_1.registerComponent;
      } });
      Object.defineProperty(exports, "registerComponents", { enumerable: true, get: function() {
        return Component_1.registerComponents;
      } });
      Object.defineProperty(exports, "hasComponent", { enumerable: true, get: function() {
        return Component_1.hasComponent;
      } });
      Object.defineProperty(exports, "addComponent", { enumerable: true, get: function() {
        return Component_1.addComponent;
      } });
      Object.defineProperty(exports, "addComponents", { enumerable: true, get: function() {
        return Component_1.addComponents;
      } });
      Object.defineProperty(exports, "setComponent", { enumerable: true, get: function() {
        return Component_1.setComponent;
      } });
      Object.defineProperty(exports, "removeComponent", { enumerable: true, get: function() {
        return Component_1.removeComponent;
      } });
      Object.defineProperty(exports, "removeComponents", { enumerable: true, get: function() {
        return Component_1.removeComponents;
      } });
      Object.defineProperty(exports, "getComponent", { enumerable: true, get: function() {
        return Component_1.getComponent;
      } });
      Object.defineProperty(exports, "set", { enumerable: true, get: function() {
        return Component_1.set;
      } });
      var Query_1 = require_Query();
      Object.defineProperty(exports, "commitRemovals", { enumerable: true, get: function() {
        return Query_1.commitRemovals;
      } });
      Object.defineProperty(exports, "removeQuery", { enumerable: true, get: function() {
        return Query_1.removeQuery;
      } });
      Object.defineProperty(exports, "registerQuery", { enumerable: true, get: function() {
        return Query_1.registerQuery;
      } });
      Object.defineProperty(exports, "query", { enumerable: true, get: function() {
        return Query_1.query;
      } });
      Object.defineProperty(exports, "observe", { enumerable: true, get: function() {
        return Query_1.observe;
      } });
      Object.defineProperty(exports, "onAdd", { enumerable: true, get: function() {
        return Query_1.onAdd;
      } });
      Object.defineProperty(exports, "onRemove", { enumerable: true, get: function() {
        return Query_1.onRemove;
      } });
      Object.defineProperty(exports, "Or", { enumerable: true, get: function() {
        return Query_1.Or;
      } });
      Object.defineProperty(exports, "And", { enumerable: true, get: function() {
        return Query_1.And;
      } });
      Object.defineProperty(exports, "Not", { enumerable: true, get: function() {
        return Query_1.Not;
      } });
      Object.defineProperty(exports, "Any", { enumerable: true, get: function() {
        return Query_1.Any;
      } });
      Object.defineProperty(exports, "All", { enumerable: true, get: function() {
        return Query_1.All;
      } });
      Object.defineProperty(exports, "None", { enumerable: true, get: function() {
        return Query_1.None;
      } });
      Object.defineProperty(exports, "onGet", { enumerable: true, get: function() {
        return Query_1.onGet;
      } });
      Object.defineProperty(exports, "onSet", { enumerable: true, get: function() {
        return Query_1.onSet;
      } });
      Object.defineProperty(exports, "Hierarchy", { enumerable: true, get: function() {
        return Query_1.Hierarchy;
      } });
      Object.defineProperty(exports, "Cascade", { enumerable: true, get: function() {
        return Query_1.Cascade;
      } });
      Object.defineProperty(exports, "asBuffer", { enumerable: true, get: function() {
        return Query_1.asBuffer;
      } });
      Object.defineProperty(exports, "isNested", { enumerable: true, get: function() {
        return Query_1.isNested;
      } });
      Object.defineProperty(exports, "noCommit", { enumerable: true, get: function() {
        return Query_1.noCommit;
      } });
      var pipe_1 = require_pipe();
      Object.defineProperty(exports, "pipe", { enumerable: true, get: function() {
        return pipe_1.pipe;
      } });
      var Relation_1 = require_Relation();
      Object.defineProperty(exports, "withAutoRemoveSubject", { enumerable: true, get: function() {
        return Relation_1.withAutoRemoveSubject;
      } });
      Object.defineProperty(exports, "withOnTargetRemoved", { enumerable: true, get: function() {
        return Relation_1.withOnTargetRemoved;
      } });
      Object.defineProperty(exports, "withStore", { enumerable: true, get: function() {
        return Relation_1.withStore;
      } });
      Object.defineProperty(exports, "createRelation", { enumerable: true, get: function() {
        return Relation_1.createRelation;
      } });
      Object.defineProperty(exports, "getRelationTargets", { enumerable: true, get: function() {
        return Relation_1.getRelationTargets;
      } });
      Object.defineProperty(exports, "Wildcard", { enumerable: true, get: function() {
        return Relation_1.Wildcard;
      } });
      Object.defineProperty(exports, "IsA", { enumerable: true, get: function() {
        return Relation_1.IsA;
      } });
      Object.defineProperty(exports, "Pair", { enumerable: true, get: function() {
        return Relation_1.Pair;
      } });
      Object.defineProperty(exports, "isRelation", { enumerable: true, get: function() {
        return Relation_1.isRelation;
      } });
      Object.defineProperty(exports, "isWildcard", { enumerable: true, get: function() {
        return Relation_1.isWildcard;
      } });
      var Hierarchy_1 = require_Hierarchy();
      Object.defineProperty(exports, "getHierarchyDepth", { enumerable: true, get: function() {
        return Hierarchy_1.getHierarchyDepth;
      } });
      Object.defineProperty(exports, "getMaxHierarchyDepth", { enumerable: true, get: function() {
        return Hierarchy_1.getMaxHierarchyDepth;
      } });
    }
  });
  return require_core();
})();
//# sourceMappingURL=index.es5.nonmin.js.map
