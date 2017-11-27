;$(document).ready(function (){
    // all ajax request
    $('a[data-request="ajax"]').on('click', function () {
        AjaxRequest($(this));
        return false;
    });
    $('input[data-request="ajax"]').on('blur', function () {
        AjaxRequest($(this));
    });
    $('form[data-request="ajax"]').on('beforeSubmit', function () {

        var form_id = $(this).attr('id');
        if(countSubmit.cnt[form_id]){
            countSubmit.cnt[form_id] = false;
            return false;
        }

        AjaxRequest($(this), countSubmit);

        countSubmit(form_id);
        return false;
    });

}); // $(document).ready


var countSubmit = counterSubmit();
function counterSubmit(){
    function counter(id){
        return counter.cnt[id] = true;
    }
    counter.cnt = {};

    return counter;
}

function AjaxRequest(e, counter) {

    var data = e.data();
    var child = window['AjaxResponse'];

    if (data.handler) {
        child = window[data.handler];
    }
    var handler = new child(e, data);

    if (!handler.before()) {
        return false;
    }


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
        // counter.cnt[e.attr('id')] = false;
    });

    deffered.fail(function(result){
        handler.resp = result;
        handler.log();
    });

    return false;
}

// Parent Response
function AjaxResponse(element, data) {
    this.url = '';
    this.progress = '';
    this.data = data;
    this.element = element;
    this.form = {};
    this.resp = {};
    this.modal = $('#simpleModal');
}

AjaxResponse.prototype.log = function() {
    console.log(this);
    // AjaxResponse.prototype.log.apply(this);
};

AjaxResponse.prototype.before = function(){
    AjaxResponse.prototype.loader.apply(this);

    this.url = this.data.url;
    var element = this.element[0].localName;
    if(element === 'a') {
        this.url = this.element.attr('href');
    }
    if(element === 'input') {
        AjaxResponse.prototype.setInput.apply(this);
    }
    if(element === 'form') {
        this.url = this.element.attr('action');
        AjaxResponse.prototype.setForm.apply(this);
    }

    return true;
};

AjaxResponse.prototype.after = function(){
    AjaxResponse.prototype.unloader.apply(this);

    if(this.resp.success === true && this.resp.text){

        this.element.parents('.modal').modal('hide');
        AjaxResponse.prototype.showModal.apply(this);
        AjaxResponse.prototype.resetForm.apply(this);
    }
};

AjaxResponse.prototype.setForm = function(){
    var self = this;
    $.each(this.element.find('[name]'), function(i, item){
        var name = $(item).attr('name');
        self.form[name] = $(item).val();
    });
};

AjaxResponse.prototype.resetForm = function(){
    if(this.element[0].localName === 'form'){
        this.element[0].reset();
    }
};

AjaxResponse.prototype.setInput = function(){
    var name = this.element.attr('name');
    var val = this.element.val();
    this.form[name] = val;

    return val;
};

AjaxResponse.prototype.loader = function(){
    var str = '<div class="progress">';
    str += '<div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%">';
    str += '<span class="sr-only">Loading</span>';
    str += '</div>';
    str += '</div>';

    $(this.element).append(str);
    this.progress = $(this.element).find('.progress');
    $(this.element).find('.response').remove();
};

AjaxResponse.prototype.unloader = function(){
    var resp_block = '<div class="response m-t-1"></div>';

    var msg = this.resp.text ? this.resp.text : '';

    $(this.element).append(resp_block);
    var resp = $(this.element).find('.response');
    this.progress.remove();

    if(this.resp.errors){
        var errors = [];
        for(var index in this.resp.errors) {
            errors.push(this.resp.errors[index])
        }

        resp.html(errors.join(' ')).addClass('text-danger');
    }else if(this.resp.success !== true){
        resp.html('РќРµРёР·РІРµСЃС‚РЅР°СЏ РѕС€РёР±РєР°').addClass('text-danger');
    }
};

AjaxResponse.prototype.showModal = function(){
    this.modal.find('.modal-body').html(this.resp.text);
    this.modal.modal({show: 'true', backdrop: "static"});
};


// --------- Prototype Response -----------
function Test(element, data) {
    AjaxResponse.apply(this, arguments);
}
Test.prototype = Object.create(AjaxResponse.prototype);
Test.prototype.constructor = Test;

Test.prototype.before = function() {
    AjaxResponse.prototype.before.apply(this);
    // put code
};

Test.prototype.after = function() {
    console.log('after', this);
};