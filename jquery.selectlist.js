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
(function($) {
    $.selectList = function(select, options) {
        function show($item, callback) {
            options.addAnimate && ready ? "function" == typeof options.addAnimate ? options.addAnimate($item.hide()[0], callback) : ($item.hide().fadeIn(300, callback), 
            $item[0].style.display = "") : ($item[0].style.display = "", callback && callback.call($item[0]));
        }
        function hide($item, callback) {
            options.removeAnimate && ready ? "function" == typeof options.removeAnimate ? options.removeAnimate($item[0], callback) : $item.fadeOut(300, callback) : ($item.hide(), 
            callback && callback.call($item[0]));
        }
        function cmp(item1, item2) {
            return "function" == typeof options.sort ? options.sort(item1, item2) : $(item1).data("text") > $(item2).data("text") == ("desc" != options.sort);
        }
        function add(value, text, callHandler) {
            if ($(value).is("option")) {
                if ($option = $(value), first > $option[0].index) return;
                value = $option.val(), text = $option.text();
            } else $option = $selectSingle.find('option[value="' + value.replace("'", '\\"') + '"]'), 
            $option = $option.length ? $option.filter(function() {
                return !text || $(this).text() == text;
            }).add($option).eq(0) : null;
            void 0 === text && (text = $option ? $option.text() : value), $option && !options.duplicates && $option.attr("disabled", "disabled").data("disabled", 1), 
            $newItem = $(options.template.replace(/%text%/g, $("<b/>").text(text).html()).replace(/%value%/g, value)).hide(), 
            $newItem.data("value", value).data("text", text).data("option", $option).addClass(options.classPrefix + "-item"), 
            $newItem.click(function() {
                options.clickRemove && remove($(this));
            });
            var callback = function() {
                callHandler !== !1 && options.onAdd(select, value, text);
            };
            if (options.sort && ($item = $list.children().eq(0)).length) {
                for (;$item.length && cmp($newItem[0], $item[0]); ) $item = $item.next();
                show($item.length ? $newItem.insertBefore($item) : $newItem.appendTo($list), callback);
            } else show($newItem.appendTo($list), callback);
            $(select).empty(), $list.children().each(function() {
                $(select).append($("<option/>").attr({
                    value: $(this).data("value"),
                    selected: "selected"
                }));
            }), checkValidation();
        }
        function remove($item, callHandler) {
            hide($item, function() {
                var value = $(this).data("value"), text = $(this).data("text");
                $(this).data("option") && $(this).data("option").removeAttr("disabled").removeData("disabled"), 
                $(this).remove(), $(select).find('option[value="' + value + '"]').remove(), checkValidation(), 
                callHandler !== !1 && options.onRemove(select, value, text);
            });
        }
        function checkValidation() {
            select.form && "function" == typeof $(select.form).validate && $(select).add($selectSingle).hasClass($(select.form).validate().settings.errorClass) && $(select.form).validate().element(select);
        }
        var $selectSingle, $list, $item, $newItem, $option, keyEvent, ready, change, click, keypress, enter, first = 0, ua = navigator.userAgent;
        this.val = function(value) {
            return void 0 !== value && ($("option", $selectSingle).prop("disabled", !1).removeData("disabled"), 
            $list.empty(), null !== value && $.each($.makeArray(value), function(index, value) {
                add(value);
            })), $(select).val();
        }, this.add = function(value, text) {
            add(value, text);
        }, this.remove = function(value) {
            $list.children().each(function() {
                ($(this).data("value") == value || value === void 0) && remove($(this));
            });
        }, this.setOptions = function(newOptions) {
            var sort = newOptions.sort && newOptions.sort != options.sort;
            if (options = $.extend(options, newOptions), sort) {
                var items = [];
                $list.children().each(function() {
                    items[items.length] = $(this).data("value"), items[items.length] = $(this).data("text");
                }), $list.empty();
                for (var i = 0; items.length > i; i += 2) add(items[i], items[i + 1], !1);
            }
        };
        var msie = (/msie ([\w.]+)/i.exec(ua) || [])[1], safari = /webkit/i.test(ua) && !/chrome/i.test(ua);
        this.setOptions(options = $.extend({
            addAnimate: !0,
            classPrefix: "selectlist",
            clickRemove: !0,
            removeAnimate: !0,
            template: "<li>%text%</li>",
            onAdd: function() {},
            onRemove: function() {}
        }, options)), $selectSingle = $(select).clone(), $selectSingle.removeAttr("id").removeAttr("name").addClass(options.classPrefix + "-select").insertAfter($(select)), 
        $(select).empty().hide(), ($list = $(options.list || $("<ul/>").insertAfter($selectSingle))).addClass(options.classPrefix + "-list"), 
        $selectSingle.find(":selected").each(function() {
            add($(this), null, !1);
        }), $selectSingle.removeAttr("multiple"), $selectSingle[0].removeAttribute("size"), 
        $selectSingle.attr("title") && ($selectSingle.prepend($("<option/>").text($selectSingle.attr("title"))), 
        first = 1, $selectSingle[0].selectedIndex = 0), keyEvent = msie || safari ? "keydown" : "keypress", 
        $selectSingle.bind(keyEvent, function(event) {
            return keypress = !0, 13 == (event.keyCode || event.which) ? (enter = !0, $selectSingle.change(), 
            keypress = !0, !1) : void 0;
        }).change(function() {
            (keypress || click) && (change = !0, $option = $selectSingle.find("option:selected"), 
            $option.data("disabled") || keypress && !enter || add($option), keypress ? keypress = change = click = !1 : first && ($selectSingle[0].selectedIndex = 0), 
            enter = !1);
        }).mousedown(function() {
            click = !0;
        }), $selectSingle.find("option").click(function() {
            return click = !0, $(this).attr("disabled") || $(this).data("disabled") || keypress || change || add($(this)), 
            keypress || (change = click = !1), !1;
        }), ready = !0;
    }, $.fn.selectList = function(options) {
        return options = options || {}, this.filter("select").each(function() {
            $(this).data("selectList") ? $(this).data("selectList").setOptions(options) : $(this).data("selectList", new $.selectList(this, options));
        }), options.instance ? this.filter("select").data("selectList") : this;
    };
    var hookSet = $.valHooks.select.set;
    $.valHooks.select.set = function(elem, value) {
        return $(elem).data("selectList") ? $(elem).data("selectList").val(value) : hookSet(elem, value);
    };
})(jQuery);