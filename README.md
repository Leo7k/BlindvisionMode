Этот репозиторий содержит скрипт, реализующий функции "режима для слабовидящих".
Для работы скрипта вам необходимо:
1. Добавить скрипт на сайт
2. Добавить диалог настройки режима для слабовидящих (взять HTML код из файла blindvision.html)


Диалог настройки не стилизован. Вам потребуется самостоятельно добавить стили, чтобы настроить отображение и расположение элементов управления.


Вы можете добавлять дополнительные параметры в диалог. Чтобы они работали, потребуется добавить поле ввода и указать для него следующие HTML-атрибуты:


name - внутреннее имя поля ввода, необходимое для корректного применения и сохранения параметра.

data-selector - CSS-селектор, к которому будет применен ваш параметр.

data-styletype - тип применяемого стиля. Может иметь 3 значения: class, inline и filter.

При указании значения class значение вашего поля ввода будет обозначать класс, добавляемый ко всем элементам, подходящих под указанный CSS-селектор.

При указании значения inline значение вашего поля ввода будет присвоено свойству CSS, имя которого указано в атрибуте data-styleprop, у всех элементов, подходящих под указанный CSS-селектор.

При указании значения filter значение вашего поля ввода будет указывать CSS-фильтр, который будет применен ко всем элементам, подходящих под указанный CSS-селектор.

data-styleprop - имя CSS-свойства, которому будет присвоено значение (value) вашего поля ввода. Работает только когда атрибут data-styletyp равен inline.

Дополнительно имеется возможность включить озвучку текста при наведении мыши или при переключении фокуса (для корректной работы требуется русскоязычный TTS-движок)

При изменении ID диалога, формы и кнопок управления, не забудьте изменить их в таблице BLINDVISION_ELEMENT_IDS в скрипте.
