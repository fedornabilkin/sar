# SAR &mdash; simple ajax requests
Simple ajax requests - это простая работа с ajax запросами.
Скрипт позволяет быстро настроить элемент на странице для отправки данных на сервер, используя асинхронную передачу.

# Быстрый старт
Устанавливаем пакет с помощью **bower**
```bash
bower install simple-ajax-requests
```

# HTML
Вариант использования при отправке формы
```html
<form action="/test.php" data-request="ajax">
    <input name="search" type="text">
    <button type="submit">Отправить</button>
</form>
```

Вариант использования при клике по ссылке
```html
<a href="test.php" data-request="ajax">Click</a>
```

# JS
```js
$('form[data-request="ajax"]').on('submit', function () {
    AjaxRequest($(this));
    return false;
});
```

# Ответ сервера
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
формировать как ошибку. В таком случае к строке текста ответа будет 
применен css ```text-danger```
```json
{"errors":["Первая ошибка", "Вторая ошибка"]}
```

# Жизненный цикл
Перед отправкой данных вызывается **before()**, после получения ответа
сервера вызывается **after()**.

В зависимости от элемента, который инициировал событие, **before()** вызовет
**[elementName]Prepare()**

По умолчанию доступны **formPrepare()**, **inputPrepare()**, **aPrepare()**

Если **before()** вернет **true** (по умолчанию), то будет вызван **loader()**
и данные отправятся на сервер. После получения ответа вызывается **after()**,
который вызывает **unloader()** и **resetForm()**, если сервер не вернул ошибки
в массиве **errors**

Sar собирает все данные из элементов формы с атрибутом **name** и
отправляет на адрес, который указан в атрибуте **action**.


```