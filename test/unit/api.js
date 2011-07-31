module("API");

(function () {

test("remove()", function () {
    expect(3);

    $('#t').append('<select id="s1" multiple="multiple" title="Title">' +
            '<option value="1" selected="selected">One</option>' +
            '<option value="2" selected="selected">Two</option>' +
            '<option value="3" selected="selected">Three</option>' +
            '<option value="3" selected="selected">Another three</option>' +
            '<option value="4" selected="selected">Four</option>' +
            '<option value="5">Five</option>' +
            '</select>');
    
    $('#s1').selectList({ removeAnimate: false });
    
    $('#s1').selectList({ instance: true }).remove(1);
    
    deepEqual($('#s1').val(), [ "2", "3", "3", "4" ], 'Check if the ' +
            'selection is correct after one value is removed');
    
    $('#s1').selectList({ instance: true }).remove(3);
    
    deepEqual($('#s1').val(), [ "2", "4" ], 'Check if the selection is ' +
            'correct after two items with the same value are removed');
    
    $('#s1').selectList({ instance: true }).remove();
    
    deepEqual($('#s1').val(), null, 'Check if all the remaining items are ' +
            'removed when remove() is called with no arguments');
    
    testCleanup();
});

})();