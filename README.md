# SAR &mdash; simple ajax requests
Simple ajax requests - это простая работа с ajax запросами.
**SAR** позволяет быстро настроить элемент на странице для отправки данных на сервер, используя асинхронную передачу.

## Быстрый старт
Устанавливаем пакет с помощью **bower**
```bash
bower install simple-ajax-requests
```
Установка с помощью **composer**
```bash
php composer.phar require bower-asset/simple-ajax-requests
```

## HTML (не менее быстрый)
Вариант использования при отправке формы
```html
<form action="/test.php" data-request="ajax">
    <input name="search" type="text">
    <button type="submit">Отправить</button>
</form>
```

Вариант использования при клике по ссылке
```html
<a href="test.php" data-request="ajax" data-param1="value1">Click</a>
```

Вариант использования с input
```html
<input type="text" name="search" data-request="ajax" data-url="test.php">
```

## JS
```js
$('form[data-request="ajax"]').on('submit', function () {
    AjaxRequest($(this));
    return false;
});
```
```js
$('a[data-request="ajax"]').on('click', function () {
    AjaxRequest($(this));
    return false;
});
```
```js
$('input[data-request="ajax"]').on('blur', function () {
    AjaxRequest($(this), {}, inputCallBack);
    function inputCallBack(data){
        console.log(data);
    }
});
```

## AjaxRequest($('selector'), {config:''}, callBack)
**AjaxRequest** принимает три параметра
* Ссылку на элемент, который инициировал событие
* <s>Объект с данными конфигурации</s> **В 1.0.0 будет удален**
* Функцию обратного вызова

По умолчанию доступна обработка тэгов ```<form> <input> <a>```


Функция обратного вызова вызывается после получения ответа от сервера.
В функцию будет передан первым параметром контекст объекта **AjaxResponse**.


## Ответ сервера
```php
// php
$response = [];
$num = 5;
if($num >= 6){
    $response['text'] = "$num больше либо равно 6";
}else{
    $response['errors'][] = "$num меньше 6";
}

$json = json_encode($response);
exit($json);
```

**SAR** ожидает в ответе сервера строку **json** с обязательным форматом
```json
{"text":"Ответ, который будет показан пользователю"}
```

В случае ошибки, чтобы привлечь внимание пользователя, ответ необходимо 
формировать следующим образом. В таком случае к строке текста ответа будет 
применен css ```text-danger```
```json
{"errors":["Первая ошибка", "Вторая ошибка"]}
```

## Изменение логики работы, свой обработчик
**SAR** позволяет переопределить большинство методов, чтобы изменить логику работы.
Для этого создайте свой обработчик и укажите его с помощью ```data-handler="customSar"```
в элементе, который инициирует отправку запроса.
```html
<a href="test.php" data-request="ajax" data-handler="customSar">Click</a>
```
Свой обработчик в обязательном порядке должен наследовать базовый объект
и принимать два аргумента.
Самый простой обработчик выглядит следующим образом:
* наследование
```js
// --------- Prototype Response -----------
function CustomSar(element, data) {
    AjaxResponse.apply(this, arguments);
    this.cfg.modal.id = 'sar-simple23';
}
CustomSar.prototype = Object.create(AjaxResponse.prototype); // IE
CustomSar.prototype.constructor = CustomSar;
```
* переопределение методов

```js
// работа SAR остановится, если before вернет false
CustomSar.prototype.before = function() {
    var status = AjaxResponse.prototype.before.apply(this);
    // put code validate
    return status;
};
```