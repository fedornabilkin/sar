;
function AjaxRequest(e, cfg, callBack) {

    var data = e.data();
    if (!data.handler) {
        data.handler = 'AjaxResponse';
    }
    var child = window[data.handler];

    var handler = new child(e, data);
    handler.custom = cfg;

    if (!handler.before()) {
        handler.after();
        return false;
    }
    handler.loader();

    var deffered = $.ajax({
        url: handler.url,
        type: "POST",
        dataType: "json",
        data: handler.form,
        beforeSend: function(data) {}
    });

    deffered.done(function (result) {
        handler.resp = result;
        handler.after();
        if(typeof callBack === 'function'){
            callBack(handler);
        }
    });

    deffered.fail(function(result){
        handler.resp = result;
        handler.log();
    });

    return false;
}

// Parent Response
function AjaxResponse(element, data) {
    this.handler = '';
    this.url = '';
    this.progress = '';
    this.data = data;
    this.element = element;
    this.form = {};
    this.resp = {};
    this.cfg = {
        'progress': {css: ''},
        'response': {css:'response', statusCss:'text-success'},
        'modal': {id:'sar-simple', innerSelector:'.modal-body'},
        'tooltip': {removeTime:2000}
    };
}

AjaxResponse.prototype.log = function() {
    console.log(this);
    // AjaxResponse.prototype.log.apply(this);
};

AjaxResponse.prototype.init = function() {
    function myExtend(def, obj){
        for(var item in obj){
            if (!obj.hasOwnProperty(item)) continue;

            if(typeof obj[item] === 'object' && typeof def[item] !== 'undefined'){
                def[item] = myExtend(def[item], obj[item]);
            }else{
                def[item] = obj[item];
            }
        }

        return def;
    }

    myExtend(this.cfg, this.custom);
};

AjaxResponse.prototype.before = function(){

    AjaxResponse.prototype.init.apply(this);
    this.handler = this.data.handler;
    this.url = this.data.url;

    var elName = this.element[0].localName;
    var protoMethod = elName+'Prepare';

    var status = window[this.handler].prototype[protoMethod].apply(this);

    this.url = (this.url === '') ? window.location.href: this.url;

    return status;
};

AjaxResponse.prototype.after = function(){
    window[this.handler].prototype.unloader.apply(this);
    if(!this.resp.errors){
        window[this.handler].prototype.resetForm.apply(this);
    }
};

AjaxResponse.prototype.resetForm = function(){
    if(this.element[0].localName === 'form'){
        this.element[0].reset();
    }
};

AjaxResponse.prototype.formPrepare = function(){
    var self = this;
    self.url = self.element.attr('action');
    $.each(this.element.find('[name]'), function(i, item){
        var name = $(item).attr('name');
        self.form[name] = $(item).val();
    });
    return true;
};

AjaxResponse.prototype.inputPrepare = function(){
    var name = this.element.attr('name');
    this.form[name] = this.element.val();

    if(typeof this.url === 'undefined'){
        this.resp.errors = ['Missing data-url attribute in the element'];
        return false;
    }
    return true;
};

AjaxResponse.prototype.aPrepare = function(){
    this.url = this.element.attr('href');

    for(var item in this.data){
        if (!this.data.hasOwnProperty(item)) continue;
        this.form[item] = this.data[item];
    }
    return true;
};

AjaxResponse.prototype.defaultPrepare = function(){
    return true;
};



AjaxResponse.prototype.loader = function(){
    var str = '<div class="progress">';
    str += '<div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%">';
    str += '<span class="sr-only">Loading</span>';
    str += '</div>';
    str += '</div>';

    var modal = $('#'+this.cfg.modal.id);
    if(modal.length > 0){
        this.resp.text = str;
        window[this.handler].prototype.showModal.apply(this);
    }else if(this.element[0].localName === 'form'){
        $(this.element).append(str);
        this.progress = $(this.element).find('.progress');
        $(this.element).find('.'+this.cfg.response.css).remove();
    }


};

AjaxResponse.prototype.unloader = function(){

    if(!this.resp.text && !this.resp.errors){
        this.resp.errors = ['Unknown error'];
    }
    window[this.handler].prototype.getErrors.apply(this);

    var modal = $('#'+this.cfg.modal.id);
    if(modal.length > 0){
        window[this.handler].prototype.showModal.apply(this);
    }else if(this.element[0].localName === 'form'){
        this.progress.html(this.resp.text)
            .removeAttr('class')
            .addClass(this.cfg.response.statusCss +' '+ this.cfg.response.css);
    }else{
        this.element.after('<span class="tooltip"></span>');
        var opts = {'title':this.resp.text, 'container':'body', 'placement':'top auto', 'viewport':'body'};
        var span = $(this.element).next('.tooltip');
        span.tooltip(opts).tooltip('show');
        setTimeout(function(){
            span.tooltip('hide').remove();
        }, this.cfg.tooltip.removeTime);
    }
};



AjaxResponse.prototype.showModal = function(){
    var modal = $('#'+this.cfg.modal.id);
    modal.find(this.cfg.modal.innerSelector).html(this.resp.text).addClass(this.cfg.response.statusCss);
    modal.modal({show: 'true', backdrop: "static"});
};

AjaxResponse.prototype.getErrors = function(){
    if(this.resp.errors) {
        var errors = [];
        for (var index in this.resp.errors) {
            errors.push(this.resp.errors[index])
        }
        this.resp.text = errors.join('. ');
        this.cfg.response.statusCss = 'text-danger';
    }
};