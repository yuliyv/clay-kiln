import * as store from '../core-data/store';
import * as components from '../core-data/components';
import * as api from '../core-data/api';
import * as model from './model';
import * as references from '../utils/references';
import lib from './create';

describe('component creator', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(store);
    sandbox.stub(components);
    sandbox.stub(api);
    sandbox.stub(model);
    sandbox.stub(references, 'isDefaultComponent').returns(true);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('resolves to empty array if passed no components', () => {
    return lib([]).then((res) => expect(res).to.eql([]));
  });

  it('creates a single component with no children', () => {
    components.getSchema.returns({});
    components.getData.returns({ a: 'b' });
    components.getModel.returns(null);
    // note: the _ref will be a uid that we can't test against
    return lib([{ name: 'foo' }]).then((res) => expect(res[0].a).to.equal('b'));
  });

  it('creates a single component with data, but no children', () => {
    components.getSchema.returns({});
    // make sure we don't accidentally expand non-child-component arrays and objects in the data
    components.getData.returns({ a: 'b', nonComponentArray: [{ text: 'ok' }], nonComponentProp: { text: 'ok' } });
    components.getModel.returns(null);
    return lib([{ name: 'foo', data: { c: 'd' } }]).then((res) => {
      expect(res[0].a).to.equal('b');
      expect(res[0].c).to.equal('d');
    });
  });

  it('creates a single component with a child list', () => {
    components.getSchema.returns({});
    // no store.state.site.prefix, hence undefined
    components.getData.withArgs('undefined/components/foo').returns({ a: 'b', children: [{ _ref: 'undefined/components/bar' }] });
    components.getData.withArgs('undefined/components/bar').returns({ c: 'd' });
    components.getModel.returns(null);
    // note: the _ref will be a uid that we can't test against
    return lib([{ name: 'foo' }]).then((res) => expect(res[0].children[0].c).to.equal('d'));
  });

  it('creates a single component with a child prop', () => {
    components.getSchema.returns({});
    // no store.state.site.prefix, hence undefined
    components.getData.withArgs('undefined/components/foo').returns({ a: 'b', child: { _ref: 'undefined/components/bar' } });
    components.getData.withArgs('undefined/components/bar').returns({ c: 'd' });
    components.getModel.returns(null);
    // note: the _ref will be a uid that we can't test against
    return lib([{ name: 'foo' }]).then((res) => expect(res[0].child.c).to.equal('d'));
  });

  it('resolves default data from the server', () => {
    components.getSchema.returns({});
    api.getObject.returns(Promise.resolve({ a: 'b' }));
    components.getData.returns(null);
    components.getModel.returns(null);
    return lib([{ name: 'foo' }]).then(() => expect(api.getObject).to.have.been.called);
  });

  it('resolves default data from the server', () => {
    components.getSchema.returns(null);
    api.getSchema.returns(Promise.resolve({}));
    components.getData.returns({ a: 'b' });
    components.getModel.returns(null);
    return lib([{ name: 'foo' }]).then(() => expect(api.getSchema).to.have.been.called);
  });

  it('updates store with data passed through model.js', () => {
    components.getSchema.returns({});
    components.getData.returns({ a: 'b' });
    components.getModel.returns(true);
    model.save.returns(Promise.resolve({ c: 'd' }));
    model.render.returns(Promise.resolve({ c: 'd' }));
    return lib([{ name: 'foo' }]).then(() => {
      expect(model.save).to.have.been.called;
      expect(model.render).to.have.been.called;
    });
  });
});