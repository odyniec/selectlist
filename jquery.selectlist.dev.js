/*
 * selectList jQuery plugin
 * version 0.3.3
 *
 * Copyright (c) 2009-2010 Michal Wojciechowski (odyniec.net)
 *
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * http://odyniec.net/projects/selectlist/
 *
 */

(function($) {

$.selectList = function(select, options) {
    var 
        name = $(select).attr('name'),
    
        /* jQuery object representing the list of selected options */
        $list,
        
        /* List items */
        $item, $newItem,
        
        /* Option element */
        $option,
        
        /* Keyboard event ... (keydown for MSIE and Safari, keypress for other browsers) */
        keyEvent,
        
        /* Has the plugin been initialized? */
        ready,
        
        /*
         * The index of the first option element (equal to 1 if there is a hint,
         * otherwise 0)
         */
        first = 0,
        
        /*
         * Flags ...
         */
        change, click, keypress, enter;
        
    /**
     * Make list item visible
     * 
     * @param $item
     *            A jQuery object representing the list item
     * @param callback
     *            Callback function to be called when the item is shown
     */
    function show($item, callback) {
        if (options.addAnimate && ready)
            if (typeof options.addAnimate == 'function')
                options.addAnimate($item.hide().get(0), callback);
            else
                $item.hide().fadeIn(300, callback);
        else {
            $item.show();
            if (callback)
                callback.call($item.get(0));
        }
    }

    /**
     * Make list item hidden
     * 
     * @param $item
     *            A jQuery object representing the list item
     * @param callback
     *            Callback function to be called when the item is hidden
     */
    function hide($item, callback) {
        if (options.removeAnimate && ready)
            if (typeof options.removeAnimate == 'function')
                options.removeAnimate($item.get(0), callback);
            else
                $item.fadeOut(300, callback);
        else {
            $item.hide();
            if (callback)
                callback.call($item.get(0));
        }
    }

    /**
     * Compare two list items by text data or with an user-defined function
     * 
     * @param item1
     *            A DOM object representing the first list item to compare
     * @param item2
     *            A DOM object representing the second list item to compare
     * @returns boolean
     */
    function cmp(item1, item2) {
//        if (typeof options.sort == 'function')
//            /*
//             * A custom sort function is provided -- use it to compare the items
//             */
//            return options.sort(item1, item2);
//        else
//            /*
//             * Do a stringwise comparison of text data of the two items. If the
//             * sort option is set to "desc", the result will be negated.
//             */
//            return ($(item1).data('text') > $(item2).data('text'))
//                == (options.sort != 'desc');
        return typeof options.sort == 'function' ?
            /*
             * A custom sort function is provided -- use it to compare the items
             */
            options.sort(item1, item2)
            /*
             * Do a stringwise comparison of text data of the two items. If the
             * sort option is set to "desc", the result will be negated.
             */
            : ($(item1).data('text') > $(item2).data('text'))
                == (options.sort != 'desc');
    }

    /* add(option element)
       add(value, text) */
    /**
     * Add a new item to the list of selected items.
     * 
     * @param value
     *            Value of the new item or a DOM object representing a HTML
     *            option element
     * @param text
     *            Text of the new item (ignored if value is an option DOM
     *            object)
     * @param callHandler
     *            If set to <code>false</code>, the <code>onAdd</code>
     *            callback function will not be executed after the element is
     *            added.
     */
    function add(value, text, callHandler) {
        $option = null;
        
        /* Check if an <option> element was passed */
        if ($(value).is('option')) {
            $option = $(value);

            /* 
             * If this is the first option that serves as a hint,
             * we don't want to really add it.
             */
            if ($option.get(0).index < first)
                return;

            /* If duplicates are not allowed, disable the option */
            if (!options.duplicates)
                $option.attr('disabled', 'disabled')
                    /* 
                     * IE6 does not support the "disabled" attribute,
                     * so we'll set our own flag as a workaround 
                     */
                    .data('disabled', 1);
            
            /* Extract value and text */
            value = $option.val();
            text = $option.text();
        }

        /*
         * Create the new list item based on the template, and make it hidden.
         * The $('<b/>').text(text).html() part is a trick to convert special
         * characters (like "<" and ">") to HTML entities.
         */
        $newItem = $(options.template.replace(/%text%/g,
            $('<b/>').text(text).html()).replace(/%value%/g, value)).hide();

        /*
         * Insert a hidden input element into the new item, give it the
         * same name attribute as the original <select> element, and set
         * its value
         */
        $('<input type="hidden" />').appendTo($newItem)
                .attr({name: name, value: value});

        /*
         * Save the text, value, and the option element (if it was passed)
         * for later use
         */
        $newItem.data('value', value).data('text', text);
        if ($option)
            $newItem.data('option', $option);
        
        $newItem.addClass(options.classPrefix + '-item');

        /*
         * If the clickRemove option is enabled, add a click event handler that
         * removes the item
         */
        if (options.clickRemove)
            $newItem.click(function () {
                remove($(this));
            });
        
        /*
         * If there is a hint (first == 1), set it back as the selected option
         * in the select element
         */
        if (first && !keypress)
            select.selectedIndex = 0;

        /* Callback function that will be called after the item is added */
        var callback = function () {
            if (callHandler !== false)
                options.onAdd(select, value, text);           
        };
        
        if (options.sort && ($item = $list.children().eq(0)).length) {
            /*
             * If the list is supposed to be automatically sorted, look for the
             * first item which is greater (... cmp() function ...) than the new item, and
             * insert the new item right before it.
             */
            while ($item.length && cmp($newItem.get(0), $item.get(0)))
                $item = $item.next();

//            if ($item.length)
//                show($newItem.insertBefore($item), callback);
//            else
//                show($newItem.appendTo($list), callback);
            
            show($item.length ? $newItem.insertBefore($item)
                : $newItem.appendTo($list), callback);
        }
        else
            /* Otherwise, append the new element at the end of the list */
            show($newItem.appendTo($list), callback);
        
        checkValidation();
    }
    
    /**
     * Remove an item from the list of selected items
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
            
            checkValidation();
            
            if (callHandler !== false)
                options.onRemove(select, value, text);
        });
    }
    
    function checkValidation() {
        if ($(select.form).validate && $(select).is('.' + 
                $(select.form).validate().settings.errorClass))
            $(select.form).validate().element(select);
    }
    
    /* Publicly available methods */
    
    this.val = function () {
        var values = [];
        
        $list.find('input[name=' + name + ']')
            .each(function () {
                values.push($(this).val());
            });

        return values;
    };
    
    /**
     * @param value Value of the item being added
     * @param text  Text that will be displayed on the newly added item
     * @returns
     */
    this.add = function (value, text) {
        add(value, text);
    };
    
    /**
     * @param value Value of the item being removed
     * @returns
     */
    this.remove = function (value) {
        $list.children().each(function () {
            if ($(this).data('value') == value)
                remove($(this));
        });
    };

    /**
     * @param newOptions
     *            An object representing the new options
     * @return
     */
    this.setOptions = function (newOptions) {
        /* If the new sort option differs from the ... */
        var sort = newOptions.sort && newOptions.sort != options.sort;

        options = $.extend(options, newOptions);

        /* Re-sort the list */
        if (sort)
            $list.children().slice(first).each(function () {
                add($(this).data('value'), $(this).data('text'), false);
            }).remove();
    };

    /* Initialization starts here */
    
    this.setOptions(options = $.extend({
        addAnimate: true,
        classPrefix: 'selectlist',
        clickRemove: true,
        removeAnimate: true,
        template: '<li>%text%</li>',
        onAdd: function () {},
        onRemove: function () {}
    }, options));
    
    /* Get the list element from options or create a new one */
    ($list = $(options.list || $('<ul />').insertAfter($(select))))
        .addClass(options.classPrefix + '-list');

    /* Add pre-selected options to the list */
    $(select).find(':selected').each(function () {
        add($(this), null, false);
    });

    /* The original multiple select element becomes a dropdown list */
    $(select).removeAttr('multiple').removeAttr('size');
    
    if ($(select).attr('title')) {
        $(select).prepend($('<option />').text($(select).attr('title')));
        first = 1;
        /* 
         * We could set the "selected" attribute for the option element above,
         * but IE7 and IE8 seem to ignore it, so we need to set the hint with
         * select.selectedIndex.
         */ 
        select.selectedIndex = 0;
    }

    /*
     * In MSIE and WebKit, we need to use the keydown event instead of keypress
     */
    keyEvent = $.browser.msie || $.browser.safari ? 'keydown' : 'keypress';
    
    $(select).bind(keyEvent, function (event) {
        keypress = true;
        
        /* Check if Enter has been pressed */
        if ((event.keyCode || event.which) == 13) {
            enter = true;
            /* Trigger the change event */
            $(select).change();
            keypress = true;
            /* Return false to prevent form submission */
            return false;
        }
    })
    .change(function() {
        if (!keypress && !click) return;
        change = true;
        /* Get the currently selected option */
        $option = $(select).find('option:selected');
        if (!$option.data('disabled') && (!keypress || enter))
            add($option);
        
        if (keypress)
            keypress = change = click = false;
        
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
     * occurred -- this is useful when duplicate items are allowed and the
     * user wants to select the same item again.
     * 
     * This is only supported in browsers that report click events for
     * option elements (works in FF3 and Opera, does not work in MSIE and
     * Chrome).
     */
    $(select).find('option').click(function (event) {
        /*
         * In FireFox, clicking the select element to open the list
         * of options sometimes triggers the click event handler for the
         * item that's currently at the top, resulting in it being
         * added to the selection list. To prevent this, we need to
         * exit the handler if the click has occurred within the select
         * element's boundaries.
         */
        if ($.browser.mozilla && event.pageX >= $(select).offset().left &&
                event.pageX <= $(select).offset().left + $(select).outerWidth() &&
                event.pageY >= $(select).offset().top &&
                event.pageY <= $(select).offset().top + $(select).outerHeight())
            return false;
        
        click = true;
        
        if (!($(this).attr('disabled') || $(this).data('disabled')
                || keypress || change)) 
            add($(this));
        
        if (!keypress)
            change = click = false;
        
        return false;
    });
    
    $(select.form).submit(function () {
        /*
         * We discard the "name" attribute to prevent the select element's value
         * from being transmitted along with the selected options.
         */

        /*
         * If the Validation plugin is used
         * (http://docs.jquery.com/Plugins/Validation), remove the attribute
         * only after the form has been successfully validated.
         */
        if ($(select.form).validate && !$(select.form).valid())
            return;

        $(select).removeAttr('name');
    });
    
    /*
     * This prevents the browser from pre-populating the list with the last
     * selected option when the page is reloaded.
     */
    $(window).bind('beforeunload', function () {
        $(select).removeAttr('name');
    });
    
    if ($.validator) {
        validatorGetLength = $.validator.prototype.getLength;        
        $.validator.prototype.getLength = function (value, element) {
            return $(element).is('select') && $(element).data('selectList') ?
                $(element).data('selectList').val().length
                : validatorGetLength(value, element);
        };
    }

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
        return $(this).filter('select').data('selectList');

    return this;
};  

/*
 * This piece of code overrides the core jQuery method .val() so that it returns
 * the correct array of values when .val() is called on a multiple selection
 * element with selectList attached.
 * 
 * I'm a bit reluctant to 
 */

var jQueryVal = $.fn.val, validatorGetLength;

$.fn.val = function (value) {
//    return (typeof value == 'undefined' && $(this).data('selectList') ?
//        $(this).data('selectList').val() : jQueryVal.call(this, value));
//    if ($(this).get(0).tagName.toLowerCase() == 'select')
//        alert('data selectList: ' + $(this).data('selectList'));
    return (typeof value == 'undefined' && this.data('selectList') ?
        this.data('selectList').val : jQueryVal).call(this, value);
};

})(jQuery);
