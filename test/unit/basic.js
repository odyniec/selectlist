module("Basic");

(function () {

test("Initialization", function () {
    expect(2);

    $('#t').append('<form id="f1">' +
            '<input id="i1" type="hidden" name="i" value="1" />' +
            '<select id="s1" name="s" multiple="multiple" title="Title">' +
            '<option value="1">One</option>' +
            '<option value="2">Two</option>' +
            '<option value="3">Three</option>' +
            '</select>' +
            '</form>');
    
    $('#s1').selectList();

    ok($('#s1').selectList({ instance: true }) instanceof jQuery.selectList,
            'Check if "instance: true" returns an instance of ' +
            'jQuery.selectList');
    
    ok($('#s1').is(':not(:visible)'), 'Check if the original select element ' +
            'is not visible');
    
    testCleanup();
});

test("Pre-selecting options", function () {
    $('#t').append('<form id="f1">' +
            '<input id="i1" type="hidden" name="i" value="1" />' +
            '<select id="s1" name="s" multiple="multiple" title="Title">' +
            '<option value="1" selected="selected">One</option>' +
            '<option value="2">Two</option>' +
            '<option value="3" selected="selected">Three</option>' +
            '<option value="3" selected="selected">Another three</option>' +
            '<option value="4">Four</option>' +
            '</select>' +
            '</form>');
    
    $("#s1").selectList({});
    
    equal($("#s1 option:selected").length, 3, "Check if the original select " +
            "element has the correct number of selected options");
    
    equal($(".selectlist-list li").length, 3, "Check if the selected items " +
            "list has the correct number of items");
    
    deepEqual($("#s1").val(), [ "1", "3", "3" ], "Check if the .val() method " +
            "returns the correct array of values");
    
    equal($(".selectlist-list li").text().replace(" ", ""), 
            "OneThreeAnotherthree", "Check if the items on the list have the " +
            "correct text");
    
    testCleanup();
});

test("List contents", function () {
    $('#t').append('<form id="f1">' +
            '<input id="i1" type="hidden" name="i" value="1" />' +
            '<select id="s1" name="s" multiple="multiple" title="Title">' +
            '<option value="1">One</option>' +
            '<option value="2">Two</option>' +
            '<option value="3">Three</option>' +
            '<option value="3">Another three</option>' +
            '</select>' +
            '</form>');
    
    var sl = $("#s1").selectList({ instance: true });
    
    sl.add("1");
    
    equal($(".selectlist-list").children().length, 1, "Check if the " +
            "selected items list has one element");
    equal($(".selectlist-item:last-child").text(), "One", "Check if the " +
            "added item has the correct label text");
    
    sl.add("2", "Two");
    
    equal($(".selectlist-list").children().length, 2, "Check if the " +
            "selected items list has two elements");
    equal($(".selectlist-item:last-child").text(), "Two", "Check if the " +
            "second added item has the correct label text");

    sl.add("2", "Another two");
    
    equal($(".selectlist-item:last-child").text(), "Another two", "Check if " +
            "the third added item has the correct label text (different than " +
            "option text)");

    sl.add("3");
    
    equal($(".selectlist-item:last-child").text(), "Three", "Check if the " +
            "next added option has the correct label text (matching the " +
            "given value)");

    sl.add("4");
    
    equal($("#s1 option:last-child").val(), "4", "Check if adding an item " +
            "with a new value adds a new option to the original select " +
            "element");
    
    testCleanup();
});

test("Getting values", function () {
    expect(5);

    $('#t').append('<form id="f1">' +
            '<input id="i1" type="hidden" name="i" value="1" />' +
            '<select id="s1" name="s" multiple="multiple" title="Title">' +
            '<option value="1">One</option>' +
            '<option value="2">Two</option>' +
            '<option value="3">Three</option>' +
            '</select>' +
            '</form>' +
            '<select id="s2" name="s2" multiple="multiple">' +
            '<option value="1" selected="selected">One</option>' +
            '<option value="2">Two</option>' +
            '<option value="3" selected="selected">Three</option>' +
            '</select>');
    
    var serializedForm = $('#f1').serialize();

    $('#s1').selectList();

    deepEqual($('#s1').val(), null, 'Check if the .val() method ' +
            'returns the correct value with no options selected');
    
    equal($('#f1').serialize(), 'i=1', 'Check if the serialized form data ' +
            'is correct with no options selected');
    
    $('#s1').selectList({ instance: true }).add("1", "One");
    $('#s1').selectList({ instance: true }).add("2", "Two");
    
    deepEqual($('#s1').val(), [ "1", "2" ], 'Check if the .val() method ' +
            'returns the correct value with some options selected');

    equal($('#f1').serialize(), 'i=1&s=1&s=2', 'Check if the serialized ' +
            'form data is correct with some options selected');

    deepEqual($('#s2').val(), [ "1", "3" ], 'Check if the .val() method ' +
            'works for a regular select element');
    
    testCleanup();
});

test("Setting values", function () {
    $('#t').append('<form id="f1">' +
            '<input id="i1" type="hidden" name="i" value="1" />' +
            '<select id="s1" name="s" multiple="multiple" title="Title">' +
            '<option value="1">One</option>' +
            '<option value="2">Two</option>' +
            '<option value="3">Three</option>' +
            '</select>' +
            '</form>' +
            '<select id="s2" name="s2" multiple="multiple">' +
            '<option value="1">One</option>' +
            '<option value="2">Two</option>' +
            '<option value="3">Three</option>' +
            '</select>');

    $("#s1").selectList();
    
    $("#s1").val("1");
    
    deepEqual($("#s1").val(), [ "1" ], "Check that a single value is set " +
            "correctly");
    
    $("#s1").val([ 1, 3 ]);
    
    deepEqual($("#s1").val(), [ "1", "3" ], "Check that multiple values are " +
            "set correctly");
    
    $("#s1").val(function () { return [ "1", "2" ]; });
    
    deepEqual($("#s1").val(), [ "1", "2" ], "Check that values can be set " +
            "using a function");
    
    $('#s2').val([ 2, 3 ]);
    
    deepEqual($('#s2').val(), [ "2", "3" ], "Check if setting values work " +
            "with a regular select element");
    
    testCleanup();
});

test("Misc", function () {
    $('#t').append('<form id="f1">' +
            '<input id="i1" type="hidden" name="i" value="1" />' +
            '<select id="s1" name="s" multiple="multiple" title="Title">' +
            '<optgroup label="Group 1">' +
                '<option value="1">One</option>' +
                '<option value="2">Two</option>' +
            '</optgroup>' +
            '<optgroup label="Group 2">' +
                '<option value="3">Three</option>' +
                '<option value="4">Four</option>' +
            '</optgroup>' +
            '</select>' +
            '</form>');
    
    var sl = $("#s1").selectList({ instance: true });

    deepEqual([ $("select:visible optgroup").eq(0).attr("label"),
                $("select:visible optgroup").eq(1).attr("label") ],
                [ "Group 1", "Group 2" ], "Check if the cloned select " +
                "element has the same optgroups as the original one");
    
    stop();
    
    $("#s1").selectList({
        onAdd: function (select, value, text) {
            equal($(".selectlist-list li:last-child").text(),
                "<span />", "Check if special characters in option " +
                "text are handled correctly");
            
            testCleanup();
            start();
        }
    });

    sl.add("span", "<span />");
});

test("Sorting", function () {
    $("#t").append('<form id="f1">' +
            '<input id="i1" type="hidden" name="i" value="1" />' +
            '<select id="s1" name="s" multiple="multiple" title="Title">' +
            '<option value="2" selected="selected">2</option>' +
            '<option value="1" selected="selected">1</option>' +
            '<option value="4" selected="selected">4</option>' +
            '</select>' +
            '</form>');

    $("#s1").selectList({ sort: true });
    
    deepEqual($("#s1").val(), [ "1", "2", "4"], "Check if the selected " +
            "options are sorted in ascending order");
    
    equal($(".selectlist-list li").text().replace(" ", ""), "124",
            "Check if the list of selected items is sorted in ascending order");

    $("#s1").selectList({ instance: true }).add("3", "3");
    
    deepEqual($("#s1").val(), [ "1", "2", "3", "4"], "Check if the selected " +
            "options are sorted in ascending order after an item is added");

    equal($(".selectlist-list li").text().replace(" ", ""), "1234",
            "Check if the list of selected items is sorted in ascending " +
            "order after an item is added");

    $("#s1").selectList({ sort: "desc" });
    
    deepEqual($("#s1").val(), [ "4", "3", "2", "1"], "Check if the selected " +
            "options are sorted in descending order");
    
    equal($(".selectlist-list li").text().replace(" ", ""), "4321",
            "Check if the list of selected items is sorted in descending " +
            "order");

    $("#s1").selectList({ instance: true }).add("5", "5");
    
    deepEqual($("#s1").val(), [ "5", "4", "3", "2", "1"], "Check if the " +
            "selected options are sorted in descending order after an item " +
            "is added");

    equal($(".selectlist-list li").text().replace(" ", ""), "54321",
            "Check if the list of selected items is " +
            "sorted in descending order after an item is added");
    
    $("#s1").selectList({ sort: function (item1, item2) {
        return $(item1).text() > $(item2).text();
    }});
    
    deepEqual($("#s1").val(), [ "1", "2", "3", "4", "5" ], "Check if the " +
            "selected options are sorted in ascending order with a custom " +
            "sort function");
    
    testCleanup();
});

test("Options", function () {
    /* classPrefix */
    
    $("#t").append('<select id="s1" multiple="multiple" title="Title">' +
            '<option value="1" selected="selected">One</option>' +
            '<option value="2">Two</option>' +
            '<option value="3">Three</option>' +
            '</select>');
    
    $("#s1").selectList({ classPrefix: "test" });
    
    equal($(".test-select").length, 1, "classPrefix: Check if there is one " +
            "element with the -select class");
    equal($(".test-list").length, 1, "classPrefix: Check if there is one " +
            "element with the -list class");
    equal($(".test-item").length, 1, "classPrefix: Check if there is one " +
            "element with the -item class");
    
    testCleanup();
    
    /* clickRemove */
    
    $("#t").append('<select id="s1" multiple="multiple" title="Title">' +
            '<option value="1" selected="selected">One</option>' +
            '<option value="2" selected="selected">Two</option>' +
            '<option value="3">Three</option>' +
            '</select>');
    
    $("#s1").selectList({ clickRemove: true, addAnimate: false,
        removeAnimate: false });
    
    $(".selectlist-list li:eq(0)").click();

    equal($(".selectlist-list li").length, 1, "clickRemove: Check if " +
            "clicking an item on the list removes it from selection with " +
            "clickRemove set to true");
    
    $("#s1").selectList({ clickRemove: false });
    
    $(".selectlist-list li:eq(0)").click();

    equal($(".selectlist-list li").length, 1, "clickRemove: Check if " +
            "clicking an item on the list does not remove it from selection " +
            "with clickRemove set to false");

    testCleanup();
    
    /* duplicates */
    
    $("#t").append('<select id="s1" name="s" multiple="multiple" title="Title">' +
            '<option value="1" selected="selected">One</option>' +
            '<option value="2">Two</option>' +
            '<option value="3">Three</option>' +
            '</select>');
    
    $("#s1").selectList();
    
    equal($(".selectlist-select option[value=\"1\"]").data("disabled"), 1,
            "duplicates: Check if the pre-selected option gets disabled with " +
            "duplicates set to false");
    
    $("#s1").selectList({ instance: true }).add($("option[value=\"2\"]"));
    
    equal($(".selectlist-select option[value=\"2\"]").data("disabled"), 1,
            "duplicates: Check if the added option gets disabled with " +
            "duplicates set to false");
    
    $("#s1").selectList({ duplicates: true, instance: true })
        .add($("option[value=\"3\"]"));
    
    equal($(".selectlist-select option[value=\"3\"]").data("disabled"),
            undefined, "duplicates: Check if the added option does not get " +
            "disabled with duplicates set to true");
    
    testCleanup();
    
    /* list */
    
    $("#t").append('<select id="s1" name="s" multiple="multiple" title="Title">' +
            '<option value="1" selected="selected">One</option>' +
            '<option value="2">Two</option>' +
            '<option value="3">Three</option>' +
            '</select>' +
            '<ol id="ol1" />');
        
    $("#s1").selectList({ list: "#ol1" })
    
    equal($("#ol1 li").length, 1, "list: Check if the custom list container " +
            "has one element");
    equal($("#ol1 li").text(), "One", "list: Check if the item text is " +
            "correct");
    
    testCleanup();
    
    /* template */
    
    $("#t").append('<select id="s1" name="s" multiple="multiple" title="Title">' +
            '<option value="1" selected="selected">One</option>' +
            '<option value="2">Two</option>' +
            '<option value="3">Three</option>' +
            '</select>');
    
    $("#s1").selectList({ template: "<li><i>%text%</i></li>" });
    
    equal($(".selectlist-list li i").length, 1, "template: Check if the " +
            "selected list item has the correct HTML structure");
    equal($(".selectlist-list li i").text(), "One", "template: Check if the " +
            "selected list item has the correct text");

    testCleanup();
});

test("Callback functions", function () {
    expect(7);

    $("#t").append('<form id="f1">' +
            '<input id="i1" type="hidden" name="i" value="1" />' +
            '<select id="s1" name="s" multiple="multiple" title="Title">' +
            '<option value="1">One</option>' +
            '<option value="2">Two</option>' +
            '<option value="3">Three</option>' +
            '</select>' +
            '</form>');
    
    var sl = $("#s1").selectList({ instance: true,
        onAdd: function (select, value, text) {
            equal(value, "1", "Check if the callback function reports " +
                    "the correct value when an item is added");
            equal(text, "One", "Check if the callback function reports " +
                    "the correct text when an item is added")

            sl.remove("1");
        },
        onRemove: function (select, value, text) {
            equal(value, "1", "Check if the callback function reports " +
                    "the correct value when an item is removed");
            equal(text, "One", "Check if the callback function reports " +
                    "the correct text when an item is removed");
            
            checkCustomText();
        }});
    
    sl.add("1");
    
    stop();
    
    var checkCustomText = function () {
        sl.setOptions({
            onAdd: function (select, value, text) {
                equal(text, "Another two", "Check if the callback function " +
                        "reports the correct text when an item is added");
                
                sl.remove("2");
            },
            onRemove: function (select, value, text) {
                equal(text, "Another two", "Check if the callback function " +
                        "reports the correct text when an item is removed");
                
                checkMultipleCalls();
            }
        });
        
        sl.add("2", "Another two");
    };
    
    var checkMultipleCalls = function () {
        var count = 0;
        
        sl.setOptions({
            onAdd: function () {},
            onRemove: function (select, value, text) {
                count++;
                
                if (count == 2) {
                    ok(true, "Check if the onRemove callback is called " +
                            "twice when two items are removed with a single " +
                            "remove() call");
                
                    testCleanup();
                    start();
                }
            }
        });
        
        sl.add("1");
        sl.add("1", "Another one");
        sl.remove("1");
    };
});

test("Validation", function () {
    $("#t").append('<form id="f1">' +
            '<select id="s1" name="s" multiple="multiple" title="Title">' +
            '<option value="1">One</option>' +
            '<option value="2">Two</option>' +
            '<option value="3">Three</option>' +
            '<option value="4">Four</option>' +
            '</select>' +
            '</form>');
    
    $("#s1").selectList();
    
    var validator = $("#f1").validate({
        rules: {
            "s": { required: true, minlength: 2, maxlength: 3 }
        },
        messages: {
            "s": { required: "required", minlength: "minlength",
                maxlength: "maxlength" }
        }
    });
    
    equal(validator.element("#s1"), false, "Check if validation is " +
            "unsuccessful when no options are selected");
    equal($("#s1").next().text(), "required", "Check if the " +
            "appropriate error type is triggered when no options are selected");
    
    $("#s1").selectList({ instance: true }).add("1");
    
    equal(validator.element("#s1"), false, "Check if validation is " +
            "unsuccessful when too few options are selected");
    equal($("#s1").next().text(), "minlength", "Check if the " +
            "appropriate error type is triggered when too few options are " +
            "selected");
    
    $("#s1").selectList({ instance: true }).add("2");
    
    equal(validator.element("#s1"), true, "Check if validation is " +
            "successful when the right number of options are selected");
    
    $("#s1").selectList({ instance: true }).add("3");
    $("#s1").selectList({ instance: true }).add("4");
    
    equal(validator.element("#s1"), false, "Check if validation is " +
            "unsuccessful when too many options are selected");
    equal($("#s1").next().text(), "maxlength", "Check if the " +
            "appropriate error type is triggered when too many options are " +
            "selected");
    
    testCleanup();
});

})();
