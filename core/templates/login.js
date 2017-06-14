
it('should change state', function() {
    var value = element(by.binding('PrivacyPolicy.value'));

    expect(value.getText()).toContain('Agree');

    element(by.model('PrivacyPolicy.value')).click();

    expect(value.getText()).toContain('Disagree');
});