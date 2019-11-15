import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
export var TaskCountEvent = 'TaskCountEvent';
export var LoadingState;

(function (LoadingState) {
  LoadingState["Start"] = "Start";
  LoadingState["Stop"] = "Stop";
  LoadingState["Depth"] = "Depth";
})(LoadingState || (LoadingState = {}));

export class PEvent {
  constructor(name, data, bubbling) {
    if (bubbling === void 0) {
      bubbling = false;
    }

    this.name = name;
    this.data = data;
    this.bubbling = bubbling;

    _defineProperty(this, "target", null);

    _defineProperty(this, "currentTarget", null);
  }

  setTarget(target) {
    this.target = target;
  }

  setCurrentTarget(target) {
    this.currentTarget = target;
  }

}
export class PDispatcher {
  constructor(parent) {
    this.parent = parent;

    _defineProperty(this, "storeHandlers", {});
  }

  addListener(ename, handler) {
    var dictionary = this.storeHandlers[ename];

    if (!dictionary) {
      this.storeHandlers[ename] = dictionary = [];
    }

    dictionary.push(handler);
    return this;
  }

  removeListener(ename, handler) {
    if (!ename) {
      Object.keys(this.storeHandlers).forEach(key => {
        delete this.storeHandlers[key];
      });
    } else {
      var handlers = this.storeHandlers;

      if (handlers.propertyIsEnumerable(ename)) {
        var dictionary = handlers[ename];

        if (!handler) {
          delete handlers[ename];
        } else {
          var n = dictionary.indexOf(handler);

          if (n > -1) {
            dictionary.splice(n, 1);
          }

          if (dictionary.length === 0) {
            delete handlers[ename];
          }
        }
      }
    }

    return this;
  }

  dispatch(evt) {
    if (!evt.target) {
      evt.setTarget(this);
    }

    evt.setCurrentTarget(this);
    var dictionary = this.storeHandlers[evt.name];

    if (dictionary) {
      for (var i = 0, k = dictionary.length; i < k; i++) {
        dictionary[i](evt);
      }
    }

    if (this.parent && evt.bubbling) {
      this.parent.dispatch(evt);
    }

    return this;
  }

  setParent(parent) {
    this.parent = parent;
    return this;
  }

}
export class TaskCounter extends PDispatcher {
  constructor(deferSecond) {
    super();
    this.deferSecond = deferSecond;

    _defineProperty(this, "list", []);

    _defineProperty(this, "ctimer", null);
  }

  addItem(promise, note) {
    if (note === void 0) {
      note = '';
    }

    if (!this.list.some(item => item.promise === promise)) {
      this.list.push({
        promise,
        note
      });
      promise.then(() => this.completeItem(promise), () => this.completeItem(promise));

      if (this.list.length === 1) {
        this.dispatch(new PEvent(TaskCountEvent, LoadingState.Start));
        this.ctimer = setTimeout(() => {
          this.ctimer = null;

          if (this.list.length > 0) {
            this.dispatch(new PEvent(TaskCountEvent, LoadingState.Depth));
          }
        }, this.deferSecond * 1000);
      }
    }

    return promise;
  }

  completeItem(promise) {
    var i = this.list.findIndex(item => item.promise === promise);

    if (i > -1) {
      this.list.splice(i, 1);

      if (this.list.length === 0) {
        if (this.ctimer) {
          clearTimeout(this.ctimer);
          this.ctimer = null;
        }

        this.dispatch(new PEvent(TaskCountEvent, LoadingState.Stop));
      }
    }

    return this;
  }

}
//# sourceMappingURL=sprite.js.map