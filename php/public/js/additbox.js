/**
 * 表单初始化脚本
 */
function initAdditbox(options){
    var defaultOptions = {
        box:            $('#additbox'),
        width:          '500px',
        height:         '360px',
        addURL:         'add.html?ajax',
        addTitle:       '添加',
        editURL:        'edit.html?ajax',
        // 下方回调中第一个参数就是defaultOptions的引用
        // 添加时的回调; 返回true会清理输入框的内容
        beforeAdd:           function(options){return true;},
        // 弹出修改窗之前的回调; 返回true会清理输入框的内容
        beforeEdit:          function(options, title, data){return true;},
        // 在修改框填充数据之后
        afterEditDataFilled: function(options, data){return true;},
        // 保存之前的回调, 返回非true时停止提交; 该对象必须存在, 不然无法进行提交; otherOptions是调用save方法时传的参数
        beforeSave:          function(options, data, otherOptions){return true;},
        // 提交成功后的回调
        afterSaved:          function(options, data){reload();return true;}
    };
    for(var o in defaultOptions){
        if(options[o]){
            defaultOptions[o] = options[o];
        }
    }

    return {
        options: defaultOptions,
        additboxLayer: undefined,
        // 现在添加/修改窗
        showAdditbox: function(title, url){
            defaultOptions['box'].attr('action', url);
            this.additboxLayer = layer.open({
                type: 1,
                title: title === undefined ? '标题' : title,
                area: [defaultOptions['width'], defaultOptions['height']],
                content: defaultOptions['box'],
                success: function(layero, index){
                    defaultOptions['box'].show();
                },
                end: function(){
                    defaultOptions['box'].hide();
                }
            });
        },
        // 隐藏添加/修改窗
        hideAdditbox: function(){
            layer.close(this.additboxLayer);
        },
        // 清空输入框, 设置select为默认的selected
        cleanup: function(){
            defaultOptions['box'].find('input,select,textarea').val('');
            defaultOptions['box'].find('select').each(function(index, item){
                $(item).val($(item).children('option[selected]').attr('value'));
            });
        },
        // 显示添加窗
        add: function(){
            if(defaultOptions['beforeAdd'] && defaultOptions['beforeAdd'] instanceof Function){
                if(defaultOptions['beforeAdd'].call(this, defaultOptions) === true){this.cleanup();}
            }
            this.showAdditbox(defaultOptions['addTitle'], defaultOptions['addURL']);
        },
        // 现在修改窗
        edit: function(title, data){
            try{
                data = JSON.parse(data);
                
                if(defaultOptions['beforeEdit'] && defaultOptions['beforeEdit'] instanceof Function){
                    if(defaultOptions['beforeEdit'].call(this, defaultOptions, title, data) === true){this.cleanup();}
                }

                this.showAdditbox(title, defaultOptions['editURL']);
                for(var field in data){
                    defaultOptions['box'].find('[name='+field+']').val(data[field]);
                }

                if(defaultOptions['afterEditDataFilled'] && defaultOptions['afterEditDataFilled'] instanceof Function){
                    if(defaultOptions['afterEditDataFilled'].call(this, defaultOptions, data) === true){}
                }
            }catch(e){
                layer.syserror(e);
            }
        },
        // 提交数据
        save: function(options){
            var thiz = this;
            var data = {};
            defaultOptions['box'].find('[name]').each(function(index, item){
                item = $(item);
                data[item.attr('name')] = item.val();
            });

            if((defaultOptions['beforeSave'] && defaultOptions['beforeSave'] instanceof Function && defaultOptions['beforeSave'].call(this, defaultOptions, data, options) === true)){
                // 提交数据
                $.ajax({
                    url: defaultOptions['box'].attr("action"),
                    data: data,
                    succeeded: function(data){
                        if(defaultOptions['afterSaved'] && defaultOptions['afterSaved'] instanceof Function){
                            return defaultOptions['afterSaved'].call(this, defaultOptions, data);
                        }
                        return true;
                    }
                });
            }

        }
    };
}