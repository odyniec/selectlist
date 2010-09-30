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

        $list,

        $item, $newItem,

        $option,

        keyEvent,

        ready,

        first = 0,

        change, click, keypress, enter;

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

    function cmp(item1, item2) {
        return typeof options.sort == 'function' ?
            options.sort(item1, item2)
            : ($(item1).data('text') > $(item2).data('text'))
                == (options.sort != 'desc');
    }

    function add(value, text, callHandler) {
        $option = null;

        if ($(value).is('option')) {
            $option = $(value);

            if ($option.get(0).index < first)
                return;

            if (!options.duplicates)
                $option.attr('disabled', 'disabled')
                    .data('disabled', 1);

            value = $option.val();
            text = $option.text();
        }

        $newItem = $(options.template.replace(/%text%/g,
            $('<b/>').text(text).html()).replace(/%value%/g, value)).hide();

        $('<input type="hidden" />').appendTo($newItem)
                .attr({name: name, value: value});

        $newItem.data('value', value).data('text', text);
        if ($option)
            $newItem.data('option', $option);

        $newItem.addClass(options.classPrefix + '-item');

        if (options.clickRemove)
            $newItem.click(function () {
                remove($(this));
            });

        if (first && !keypress)
            select.selectedIndex = 0;

        var callback = function () {
            if (callHandler !== false)
                options.onAdd(select, value, text);

        };

        if (options.sort && ($item = $list.children().eq(0)).length) {
            while ($item.length && cmp($newItem.get(0), $item.get(0)))
                $item = $item.next();

            show($item.length ? $newItem.insertBefore($item)
                : $newItem.appendTo($list), callback);
        }
        else
            show($newItem.appendTo($list), callback);

        checkValidation();
    }

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

    this.val = function () {
        var values = [];

        $list.find('input[name=' + name + ']')
            .each(function () {
                values.push($(this).val());
            });

        return values;
    };

    this.add = function (value, text) {
        add(value, text);
    };

    this.remove = function (value) {
        $list.children().each(function () {
            if ($(this).data('value') == value)
                remove($(this));
        });
    };

    this.setOptions = function (newOptions) {
        var sort = newOptions.sort && newOptions.sort != options.sort;

        options = $.extend(options, newOptions);

        if (sort)
            $list.children().slice(first).each(function () {
                add($(this).data('value'), $(this).data('text'), false);
            }).remove();
    };

    this.setOptions(options = $.extend({
        addAnimate: true,
        classPrefix: 'selectlist',
        clickRemove: true,
        removeAnimate: true,
        template: '<li>%text%</li>',
        onAdd: function () {},
        onRemove: function () {}
    }, options));

    ($list = $(options.list || $('<ul />').insertAfter($(select))))
        .addClass(options.classPrefix + '-list');

    $(select).find(':selected').each(function () {
        add($(this), null, false);
    });

    $(select).removeAttr('multiple').removeAttr('size');

    if ($(select).attr('title')) {
        $(select).prepend($('<option />').text($(select).attr('title')));
        first = 1;
        select.selectedIndex = 0;
    }

    keyEvent = $.browser.msie || $.browser.safari ? 'keydown' : 'keypress';

    $(select).bind(keyEvent, function (event) {
        keypress = true;

        if ((event.keyCode || event.which) == 13) {
            enter = true;
            $(select).change();
            keypress = true;
            return false;
        }
    })
    .change(function() {
        if (!keypress && !click) return;
        change = true;
        $option = $(select).find('option:selected');
        if (!$option.data('disabled') && (!keypress || enter))
            add($option);

        if (keypress)
            keypress = change = click = false;

        enter = false;
    })
    .mousedown(function () {
        click = true;
    });

    $(select).find('option').click(function (event) {
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
        if ($(select.form).validate && !$(select.form).valid())
            return;

        $(select).removeAttr('name');
    });

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

$.fn.selectList = function (options) {
    options = options || {};

    this.filter('select').each(function () {
        if ($(this).data('selectList'))
            $(this).data('selectList').setOptions(options);
        else
            $(this).data('selectList', new $.selectList(this, options));
    });

    if (options.instance)
        return $(this).filter('select').data('selectList');

    return this;
};

var jQueryVal = $.fn.val, validatorGetLength;

$.fn.val = function (value) {
    return (typeof value == 'undefined' && this.data('selectList') ?
        this.data('selectList').val : jQueryVal).call(this, value);
};

})(jQuery);
