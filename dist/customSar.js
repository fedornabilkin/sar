$(document).ready(function (){

    $('[data-toggle="tooltip"]').tooltip();

    $('a[data-request="ajax"]').on('click', function () {
        AjaxRequest($(this));
        return false;
    });
    $('span[data-request="ajax"]').on('click', function () {
        AjaxRequest($(this));
    });
    $('input[data-request="ajax"]').on('blur', function () {
        var cfg = {
            tooltip:{removeTime:5000},
            modal:{id:'sar-simple2'}
        };
        AjaxRequest($(this), cfg, function(){});
        function spanCallBack(e){
            console.log(e);
        }
    });
    $('form[data-request="ajax"]').on('submit', function () {
        AjaxRequest($(this));
        return false;
    });

}); // $(document).ready

// --------- Prototype Response -----------
;function CustomSar(element, data) {
    AjaxResponse.apply(this, arguments);
    this.cfg.modal.id = 'sar-simple23';
}
CustomSar.prototype = Object.create(AjaxResponse.prototype);
CustomSar.prototype.constructor = CustomSar;


CustomSar.prototype.before = function() {
    var status = AjaxResponse.prototype.before.apply(this);
    // put code
    return status;
};

CustomSar.prototype.spanPrepare = function(){
    return true;
};

// CustomSar.prototype.after = function() {
//     AjaxResponse.prototype.after.apply(this);
//     console.log('after', this);
// };

// CustomSar.prototype.loader = function() {
//     console.log('loader', this);
// };

// Test.prototype.unloader = function() {
//     console.log('unloader', this);
// };