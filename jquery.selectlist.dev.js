/*!
 * selectList jQuery plugin
 * version 0.6.1
 *
 * Copyright (c) 2009-2013 Michal Wojciechowski (odyniec.net)
 *
 * Dual licensed under the MIT (http://opensource.org/licenses/MIT)
 * and GPL (http://opensource.org/licenses/GPL-2.0) licenses.
 *
 * http://odyniec.net/projects/selectlist/
 *
 */

(function ($) {

$.selectList = function (select, options) {
    /* Variables starting with $ are jQuery objects */
    var 
        /* Single select element (drop-down list) */
        $selectSingle,
        
        /* List of selected options */
        $list,
        
        /* List items */
        $item, $newItem,
        
        /* Option element */
        $option,
        
        /*
         * Keyboard event to use (keydown for MSIE and Safari, keypress for
         * other browsers)
         */
        keyEvent,
        
        /* Has the plugin been initialized? */
        ready,
        
        /*
         * The index of the first option element (equal to 1 if there is a hint,
         * otherwise 0)
         */
        first = 0,
        
        /* Flags for keeping track of events */
        change, click, keypress, enter,

        /* User agent */
        ua = navigator.userAgent;

    /**
     * Make list item visible.
     * 
     * @param $item
     *            A jQuery object representing the list item
     * @param callback
     *            Callback function to be called when the item is shown
     */
    function show($item, callback) {
        if (options.addAnimate && ready)
            if (typeof options.addAnimate == 'function')
                options.addAnimate($item.hide()[0], callback);
            else {
                $item.hide().fadeIn(300, callback);
                /*
                 *  .fadeIn() and .show() seem to set style.display to "block",
                 *  which is definitely not what we want.
                 */
                $item[0].style.display = '';
            }
        else {
            $item[0].style.display = '';
            if (callback)
                callback.call($item[0]);
        }
    }

    /**
     * Make list item hidden.
     * 
     * @param $item
     *            A jQuery object representing the list item
     * @param callback
     *            Callback function to be called when the item is hidden
     */
    function hide($item, callback) {
        if (options.removeAnimate && ready)
            if (typeof options.removeAnimate == 'function')
                options.removeAnimate($item[0], callback);
            else
                $item.fadeOut(300, callback);
        else {
            $item.hide();
            if (callback)
                callback.call($item[0]);
        }
    }

    /**
     * Compare two list items by text data or with an user-defined function.
     * 
     * @param item1
     *            A DOM object representing the first list item to compare
     * @param item2
     *            A DOM object representing the second list item to compare
     * @returns The value returned by the user-defined function, or
     *          <code>true</code> if item1 is stringwise greater than item2,
     *          <code>false</code> otherwise
     */
    function cmp(item1, item2) {
        return typeof options.sort == 'function' ?
            /*
             * A custom sort function is provided -- use it to compare the two
             * items.
             */
            options.sort(item1, item2)
            /*
             * Do a stringwise comparison of text data of the two items. If the
             * sort option is set to "desc", the result will be negated.
             */
            : ($(item1).data('text') > $(item2).data('text'))
                == (options.sort != 'desc');
    }

    /**
     * Add a new item to the list of selected items.
     * 
     * @param value
     *            Value of the new item or a DOM object representing a HTML
     *            option element
     * @param text
     *            Text of the new item (ignored if value is a DOM option object
     * @param callHandler
     *            If set to <code>false</code>, the <code>onAdd</code>
     *            callback function will not be executed after the element is
     *            added.
     */
    function add(value, text, callHandler) {
        /* Check if an <option> element was passed */
        if ($(value).is('option')) {
            $option = $(value);

            /*
             * If this is the first option that serves as a hint, we don't want
             * to really add it.
             */
            if ($option[0].index < first)
                return;
            
            /* Extract value and text */
            value = $option.val();
            text = $option.text();
        }
        else {
            /*
             * Find the option with the given value (and possibly text) in the
             * select element.
             */
            $option = $selectSingle.find("option[value=\"" + 
                    value.replace("'", "\\\"") + "\"]");

            if ($option.length)
                $option = $option.filter(function () {
                    return !text || $(this).text() == text;
                })
                .add($option).eq(0);
            else
                $option = null;
        }
        
        if (text === undefined)
            text = $option ? $option.text() : value;
        
        /* If duplicates are not allowed, disable the option */
        if ($option && !options.duplicates)
            $option.attr('disabled', 'disabled')
                /*
                 * IE6 does not support the "disabled" attribute, so we'll set
                 * our own flag as a workaround.
                 */
                .data('disabled', 1);
            
        /*
         * Create the new list item based on the template, and make it hidden.
         * The $('<b/>').text(text).html() part is a trick to convert special
         * characters (like "<" and ">") into HTML entities.
         */
        $newItem = $(options.template.replace(/%text%/g,
            $('<b/>').text(text).html()).replace(/%value%/g, value)).hide();

        /*
         * Save the text, value, and the option element (if it was passed) for
         * later use.
         */
        $newItem.data('value', value).data('text', text).data('option', $option)
            /* Add class name */
            .addClass(options.classPrefix + '-item');

        /*
         * If the clickRemove option is enabled, add a click event handler that
         * removes the item.
         */
        $newItem.click(function () {
            if (options.clickRemove)
                remove($(this));
        });
        
        /* Callback function that will be called after the item is added */
        var callback = function () {
            if (callHandler !== false)
                options.onAdd(select, value, text);           
        };
        
        if (options.sort && ($item = $list.children().eq(0)).length) {
            /*
             * If the list is supposed to be automatically sorted, look for the
             * first item which is greater (as determined by the cmp() function)
             * than the new item, and insert the new item right before it.
             */
            while ($item.length && cmp($newItem[0], $item[0]))
                $item = $item.next();
            
            show($item.length ? $newItem.insertBefore($item)
                : $newItem.appendTo($list), callback);
        }
        else
            /* Otherwise, append the new element at the end of the list. */
            show($newItem.appendTo($list), callback);
        
        $(select).empty();
        
        $list.children().each(function () {
            $(select).append($("<option/>").attr({ value: $(this).data('value'),
                    selected: "selected" }));
        });
        
        checkValidation();
    }
    
    /**
     * Remove an item from the list of selected items.
     * 
     * @param $item
     *            A jQuery object representing the item to be removed
     * @param callHandler
     *            If set to <code>false</code>, the <code>onRemove</code>
     *            callback function will not be executed after the element is
     *            removed.
     */
    function remove($item, callHandler) {
        hide($item, function () {
            var value = $(this).data('value'),
                text = $(this).data('text');
            
            if ($(this).data('option'))
                $(this).data('option').removeAttr('disabled')
                    .removeData('disabled');
            
            $(this).remove();
            
            $(select).find("option[value=\"" + value + "\"]").remove();
            
            checkValidation();
            
            if (callHandler !== false)
                options.onRemove(select, value, text);
        });
    }

    /**
     * Check if the jQuery Validation plugin is in use and re-validate the
     * select element if it is marked as being invalid. 
     */
    function checkValidation() {
        if (select.form && typeof ($(select.form).validate) == "function" &&
                $(select).add($selectSingle).hasClass($(select.form)
                        .validate().settings.errorClass))
        {
            $(select.form).validate().element(select);
        }
    }
    
    /* Publicly available methods */
    
    /**
     * Get/set the current value, similar to using the code jQuery
     * <code>.val()</code> method on a regular multiple selection element.
     * 
     * @param value
     *            An array of strings or a single string representing the value
     *            to set as selected
     * @returns An array of values corresponding to the selected options
     */
    this.val = function (value) {
        if (value !== undefined) {
            /* Re-enable options */
            $('option', $selectSingle)
                .prop('disabled', false).removeData('disabled');
            
            $list.empty();
            
            if (value !== null)
                $.each($.makeArray(value), function (index, value) {
                    add(value);
                });
        }
        
        return $(select).val();
    };

    /**
     * Add a new item to the selection.
     * 
     * @param value
     *            The value of the new item
     * @param text
     *            Text that will be displayed on the newly added item
     */
    this.add = function (value, text) {
        add(value, text);
    };
    
    /**
     * Remove the item (or multiple items) with the given value from the
     * selection.
     * 
     * @param value
     *            The value of the item(s) being removed
     */
    this.remove = function (value) {
        $list.children().each(function () {
            if ($(this).data('value') == value || typeof value == 'undefined')
                remove($(this));
        });
    };

    /**
     * Set plugin options.
     * 
     * @param newOptions
     *            An object representing the new options
     */
    this.setOptions = function (newOptions) {
        /*
         * If the new sort option differs from the current one, set a flag to
         * re-sort the list.
         */
        var sort = newOptions.sort && newOptions.sort != options.sort;

        /* Merge the new options with the existing ones */
        options = $.extend(options, newOptions);

        /* Re-sort the list by emptying it and re-adding all the items */
        if (sort) {
            var items = [];
            $list.children().each(function () {
                items[items.length] = $(this).data('value')
                items[items.length] = $(this).data('text');
            });
            $list.empty();
            for (var i = 0; i < items.length; i += 2)
                add(items[i], items[i+1], false);
        }
    };

    /* Initialization starts here */

    /* Do the dreaded browser detection */
    var msie = (/msie ([\w.]+)/i.exec(ua)||[])[1],
        safari = /webkit/i.test(ua) && !/chrome/i.test(ua);
    
    this.setOptions(options = $.extend({
        addAnimate: true,
        classPrefix: 'selectlist',
        clickRemove: true,
        removeAnimate: true,
        template: '<li>%text%</li>',
        onAdd: function () {},
        onRemove: function () {}
    }, options));

    /*
     * Create the single select element by cloning the original multiple select.
     */
    $selectSingle = $(select).clone();
    $selectSingle.removeAttr('id').removeAttr('name')
        .addClass(options.classPrefix + '-select').insertAfter($(select));
    /* Remove all the options inside the original select, and make it hidden */
    $(select).empty().hide();

    /* Get the list element from options or create a new one */
    ($list = $(options.list || $("<ul/>").insertAfter($selectSingle)))
        .addClass(options.classPrefix + '-list');

    /* Add pre-selected options to the list */
    $selectSingle.find(':selected').each(function () {
        add($(this), null, false);
    });

    /*
     * Strip the "multiple" and "size" attributes from the original select
     * element to turn it into a drop-down list.
     */
    $selectSingle.removeAttr('multiple');
    /* 
     * Firefox 4 throws an error on removeAttr('size'), so we need to use the
     * removeAttribute() DOM method instead.
     */
    $selectSingle[0].removeAttribute('size');

    /* If there is a "title" attribute, we add it as the hint option. */
    if ($selectSingle.attr("title")) {
        $selectSingle.prepend($("<option/>")
                .text($selectSingle.attr("title")));
        first = 1;
        /* 
         * We could set the "selected" attribute for the option element above,
         * but IE7 and IE8 seem to ignore it, so we need to set the hint with
         * the selectedIndex property.
         */ 
        $selectSingle[0].selectedIndex = 0;
    }

    /*
     * In MSIE and WebKit, we need to use the keydown event instead of keypress.
     */
    keyEvent = msie || safari ? 'keydown' : 'keypress';
    
    $selectSingle.bind(keyEvent, function (event) {
        keypress = true;
        
        /* Check if Enter has been pressed */
        if ((event.keyCode || event.which) == 13) {
            enter = true;
            /* Trigger the change event */
            $selectSingle.change();
            keypress = true;
            /* Return false to prevent form submission */
            return false;
        }
    })
    .change(function() {
        if (!keypress && !click) return;
        change = true;
        /* Get the currently selected option */
        $option = $selectSingle.find("option:selected");
        if (!$option.data("disabled") && (!keypress || enter))
            add($option);
        
        if (keypress)
            /* Reset flags */
            keypress = change = click = false;
        /* 
         * If there is a hint (first == 1), set it back as the selected option
         * in the select element.
         */
        else if (first)
            $selectSingle[0].selectedIndex = 0;
        
        enter = false;
    })
    /*
     * It appears .click() is not triggered by Safari, so we need to use
     * .mousedown() instead.
     */
    .mousedown(function () {
        click = true;
    });
    
    /*
     * Add a new item when an option is clicked, even if no onchange event
     * occurred -- this is useful when duplicate items are allowed and the user
     * wants to select the same item again.
     * 
     * This is only supported in browsers that report click events for option
     * elements (works in FF3 and Opera, does not work in MSIE and Chrome).
     */
    $selectSingle.find('option').click(function (event) {
        click = true;
        
        if (!($(this).attr('disabled') || $(this).data('disabled') || keypress
                || change)) 
            add($(this));
        
        if (!keypress)
            change = click = false;
        
        return false;
    });
    
    /* Ready for action */
    ready = true;
};

/**
 * Invoke selectList on a jQuery object containing the select element(s)
 * 
 * @param options
 *            Options object
 * @return The jQuery object or a reference to selectList instance (if the
 *         <code>instance</code> options was specified)
 */
$.fn.selectList = function (options) {
    options = options || {};

    this.filter('select').each(function () {
        /* Is there already a selectList instance bound to this element? */
        if ($(this).data('selectList'))
            /* Yes there is -- reset options */
            $(this).data('selectList').setOptions(options);
        else
            /* No existing instance -- create a new one */
            $(this).data('selectList', new $.selectList(this, options));
    });

    if (options.instance)
        /*
         * Return the selectList instance bound to the first element in the set.
         */
        return this.filter('select').data('selectList');

    return this;
};

/* Use valHooks to override how the select element's value is set */
var hookSet = $.valHooks.select.set;

$.valHooks.select.set = function (elem, value) {
    return $(elem).data('selectList') ?
        $(elem).data('selectList').val(value) : hookSet(elem, value);
};

})(jQuery);
