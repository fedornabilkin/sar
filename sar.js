;$(document).ready(function (){
    $('a[data-request="ajax"]').on('click', function () {
        AjaxRequest($(this));
        return false;
    });
    $('input[data-request="ajax"]').on('blur', function () {
        AjaxRequest($(this));
    });
    $('form[data-request="ajax"]').on('submit', function () {

        // var form_id = $(this).attr('id');
        // if(countSubmit.cnt[form_id]){
        //     countSubmit.cnt[form_id] = false;
        //     return false;
        // }

        AjaxRequest($(this));
        // AjaxRequest($(this), countSubmit);
        //
        // countSubmit(form_id);
        return false;
    });

}); // $(document).ready


// var countSubmit = counterSubmit();
// function counterSubmit(){
//     function counter(id){
//         return counter.cnt[id] = true;
//     }
//     counter.cnt = {};
//
//     return counter;
// }

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
    this.cfg = {
        'progress': {'class': ''},
        'response': {'class':'response', 'status_class': 'text-success'},
        'modal': {'id':'sar-simple'}
    };
}

AjaxResponse.prototype.log = function() {
    console.log(this);
    // AjaxResponse.prototype.log.apply(this);
};

AjaxResponse.prototype.config = function(cfg){

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
        AjaxResponse.prototype.setForm.apply(this);
    }

    return true;
};

AjaxResponse.prototype.after = function(){
    AjaxResponse.prototype.unloader.apply(this);
    if(!this.resp.errors){
        AjaxResponse.prototype.resetForm.apply(this);
    }
};

AjaxResponse.prototype.setForm = function(){
    var self = this;
    self.url = self.element.attr('action');
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

    var modal = $('#'+this.cfg.modal.id);
    if(modal.length > 0){
        this.resp.text = str;
        AjaxResponse.prototype.showModal.apply(this);
    }else{
        $(this.element).append(str);
        this.progress = $(this.element).find('.progress');
    }

    $(this.element).find('.'+this.cfg.response.class).remove();

};

AjaxResponse.prototype.unloader = function(){
    AjaxResponse.prototype.getErrors.apply(this);

    var modal = $('#'+this.cfg.modal.id);
    if(modal.length > 0){
        AjaxResponse.prototype.showModal.apply(this);
    }else{
        this.progress.html(this.resp.text)
            .removeAttr('class')
            .addClass(this.cfg.response.status_class +' '+ this.cfg.response.class);
    }

    if(!this.resp.text && !this.resp.errors){
        resp.html('Unknown error').addClass('text-danger');
    }
};



AjaxResponse.prototype.showModal = function(){
    var modal = $('#'+this.cfg.modal.id);
    modal.find('.modal-body').html(this.resp.text).addClass(this.cfg.response.status_class);
    modal.modal({show: 'true', backdrop: "static"});
};

AjaxResponse.prototype.getErrors = function(){
    if(this.resp.errors) {
        var errors = [];
        for (var index in this.resp.errors) {
            errors.push(this.resp.errors[index])
        }
        this.resp.text = errors.join('. ');
        this.cfg.response.status_class = 'text-danger';
    }
};


// --------- Prototype Response -----------
function Test(element, data) {
    AjaxResponse.apply(this, arguments);
}
Test.prototype = Object.create(AjaxResponse.prototype);
Test.prototype.constructor = Test;

Test.prototype.config = function(cfg) {
    AjaxResponse.prototype.config.apply(this);
};

Test.prototype.before = function() {
    AjaxResponse.prototype.before.apply(this);
    // put code
};

Test.prototype.after = function() {
    AjaxResponse.prototype.after.apply(this);
    // console.log('after', this);
};