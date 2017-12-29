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

    var cfg_ajax = {url: handler.url};
    cfg_ajax.type = handler.cfg.ajax.type;
    cfg_ajax.dataType = handler.cfg.ajax.dataType;
    cfg_ajax.data = handler.form;
    cfg_ajax.contentType = false;
    cfg_ajax.processData = false;

    cfg_ajax.beforeSend = function(data) {};

    if(handler.progress) {
        cfg_ajax.xhr = function () {
            var xhr = $.ajaxSettings.xhr();
            xhr.upload.addEventListener('progress', function (evt) {
                if (evt.lengthComputable) {
                    var percentComplete = Math.ceil(evt.loaded / evt.total * 100);

                    // console.log(handler.progress);

                    handler.progress
                        .find('.progress-bar')
                        // .val(percentComplete)
                        .attr({'aria-valuenow': percentComplete, style: 'width:' + percentComplete + '%'})
                        .text(percentComplete + '%');
                    if (percentComplete === 100) {
                        handler.progress.addClass('progress-success');
                    }
                }
            }, false);
            return xhr;
        };
    }
    // cfg_ajax.success = function(result){
    //     handler.resp = result;
    //     handler.after();
    //     if(typeof callBack === 'function'){
    //         callBack(handler);
    //     }
    // };

    var deferred = $.ajax(cfg_ajax);


    // deferred.pipe(null, null, function (progress) {
    //     console.log(progress);
    // });
    //
    deferred.done(function (result) {
        handler.resp = result;
        handler.after();
        if(typeof callBack === 'function'){
            callBack(handler);
        }
    });

    deferred.fail(function(result){
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
        ajax: {type:'POST', dataType:'json'},
        progress: {css: '', hidden: false},
        response: {css:'response', statusCss:'text-success', hidden: false},
        modal: {id:'sar-simple', innerSelector:'.modal-body'},
        tooltip: {removeTime:2000}
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
    var formData = new FormData;
    var self = this;
    self.url = self.element.attr('action');
    $.each(this.element.find('[name]'), function(i, item){
        var e = $(item);
        var name = e.attr('name');
        var type = e.attr('type');

        if(type === 'file'){
            var files = e.prop('files');
            for (var index in files) {
                formData.append('file_' + index, files[index]);
            }
        }else{
            formData.append(name, e.val());
        }
    });
    self.form = formData;
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



AjaxResponse.prototype.loader = function(){

    var str = '<div class="progress">';
    str += '<div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="1" aria-valuemin="0" aria-valuemax="100" style="width:1%">';
    str += '<span class="sr-only">Loading</span>';
    str += '</div>';
    str += '</div>';

    var modal = $('#'+this.cfg.modal.id);
    if(modal.length > 0){
        this.resp.text = str;
        window[this.handler].prototype.showModal.apply(this);
    }else if(this.element[0].localName === 'form'){
        this.element.append(str);
        this.progress = $(this.element).find('.progress');
        this.element.find('.'+this.cfg.response.css).remove();
        if(this.cfg.progress.hidden === true){
            this.progress.removeAttr('class').addClass(this.cfg.response.css).html('');
        }
    }else{
        var html = this.element.html();
        this.element.html('<span class="fa fa-cog fa-spin"></span>').attr({'original-content':html});
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
        this.element.html(this.element.attr('original-content'));

        if(this.cfg.response.hidden === false) {
            this.element.after('<span class="tooltip"></span>');
            var opts = {'title': this.resp.text, 'container': 'body', 'placement': 'top auto', 'viewport': 'body'};
            var span = $(this.element).next('.tooltip');
            span.tooltip(opts).tooltip('show');
            setTimeout(function () {
                span.tooltip('hide').remove();
            }, this.cfg.tooltip.removeTime);
        }
    }
};



AjaxResponse.prototype.showModal = function(){
    var modal = $('#'+this.cfg.modal.id);
    modal.modal({show: 'true', backdrop: "static"});
    modal.find(this.cfg.modal.innerSelector).html(this.resp.text).addClass(this.cfg.response.statusCss);
    this.progress = modal.find('.progress');
};

AjaxResponse.prototype.getErrors = function(){
    if(this.resp.errors) {
        var errors = [];
        for (var index in this.resp.errors) {
            errors.push(this.resp.errors[index]);
        }
        this.resp.text = errors.join('. ');
        this.cfg.response.statusCss = 'text-danger';
    }
};