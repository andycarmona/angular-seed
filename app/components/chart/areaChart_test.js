describe('component: areaChart', function() {
  var $componentController;

  beforeEach(module('myApp'));
  beforeEach(inject(function(_$componentController_) {
    $componentController = _$componentController_;
  }));

  it('should expose a `data` object', function() {
    // Here we are passing actual bindings to the component
    var bindings = {data: {name: 'Wolverine'}};
    var ctrl = $componentController('areaChart', null, bindings);

    expect(ctrl.hero).toBeDefined();
    expect(ctrl.data.name).toBe('Woclverine');
  });

  xit('should call the `onDelete` binding, when deleting the hero', function() {
    var onDeleteSpy = jasmine.createSpy('onDelete');
    var bindings = {hero: {}, onDelete: onDeleteSpy};
    var ctrl = $componentController('heroDetail', null, bindings);

    ctrl.delete();
    expect(onDeleteSpy).toHaveBeenCalledWith({hero: ctrl.hero});
  });

  xit('should call the `onUpdate` binding, when updating a property', function() {
    var onUpdateSpy = jasmine.createSpy('onUpdate');
    var bindings = {hero: {}, onUpdate: onUpdateSpy};
    var ctrl = $componentController('heroDetail', null, bindings);

    ctrl.update('foo', 'bar');
    expect(onUpdateSpy).toHaveBeenCalledWith({
      hero: ctrl.hero,
      prop: 'foo',
      value: 'bar'
    });
  });

});