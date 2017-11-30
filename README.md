# SAR &mdash; simple ajax requests
Simple ajax requests - это простая работа с ajax запросами.
Скрипт позволяет быстро настроить элемент на странице для отправки данных на сервер, используя асинхронную передачу.

## Быстрый старт
Устанавливаем пакет с помощью **bower**
```bash
bower install simple-ajax-requests
```

## HTML
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
    var cfg = {
        modal:{
            id:'responseModal',
            innerSelector:'.modal-body'
        }
    };
    AjaxRequest($(this), cfg);
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
* Объект с данными конфигурации
* Функцию обратного вызова

По умолчанию доступна обработка тэгов ```<form> <input> <a>```, 
<s>если понадобится использовать, например, тэг ```<span>```, то
необходимо</s>

В конфигурации доступны для изменения следующие параметры:
```js
var cfg = {
    progress: {css: '', hidden: false},
    response: {css:'response', statusCss:'text-success', hidden: false},
    modal: {id:'sar-simple', innerSelector:'.modal-body'},
    tooltip: {removeTime:2000}
};
``` 

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

## Жизненный цикл
Перед отправкой данных вызывается **before()**, после получения ответа
сервера вызывается **after()**.
В зависимости от элемента, который инициировал событие, **before()** вызовет
**[elementName]Prepare()**.
По умолчанию доступны **formPrepare()**, **inputPrepare()**, **aPrepare()**

Если **before()** вернет **true** (по умолчанию), то будет вызван **loader()**
и данные отправятся на сервер. После получения ответа вызывается **after()**,
который вызывает **unloader()**, если сервер не вернул ошибки
в массиве **errors**,  также будет вызван **resetForm()**

