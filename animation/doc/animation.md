# animation
Das Addon animation

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String|"performanceTester"|Name des Addons im Menu und im Titel.|false|
|glyphicon|nein|String|"glyphicon-dashboard"|Glyphicon des Addons im Menu und im Titel.|false|
|url|ja|String||Url auf den Datensatz.|false|
|filters|ja|**[filter](#markdown-header-filter)**[]||Definition der Filter um die Features zu selektieren.|false|
|topMost|ja|**[topMost](#markdown-header-topmost)**||Definition der Limitierung der gefundenen Features.|false|
|attrCount|nein|String|"anzahl_pendler"|Attribut für die anzuzeigende Anzahl.|false|
|attrLegend|nein|String|"name"|Attribut für die Anzeige des Namen in der Legende.|false|
|legendUnit|nein|String|"Personen"|Einheit für Anzahl in der Legende.|false|
|steps|nein|Number|10|Anzahl der Schritte der Animation. Hier kann auch die Animationsdauer festgelegt werden. Steps / 10 entspricht ca. den Sekunden.|false|
|minPx|nein|Number|5|Mindestgröße der Punkte, die dargestellt werden sollen. Werte werden normiert.|false|
|maxPx|nein|Number|20|Maximalgröße der Punkte, die dargestellt werden sollen. Werte werden normiert.|false|
|showLineStringLayer|nein|Boolean|true|Flag die angibt ob die Linie angezeigt werden soll oder nicht.|false|
|colors|nein|Array[]|[]|RGB oder RGBA Farbarrays. Farbdefinition für die Features und Legende. Sind keine Farben oder nicht genügend Farben definiert werden neue Farben generiert.|false|


**Beispiel**
```
#!json
"animationAddOn":{
    "name": "translate#additional:addOns.animationAddOn.name",
    "glyphicon": "glyphicon-play-circle",
    "url": "../muc_config/Pendler",
    "filters": [
        {
            "__title": "Zeige mir alle Pendler an mit",
            "__defaultOptionText": "Bitte Ziel wählen",
            "__helpText": "Wähle hier das Ziel der Pendler",
            "attr": "name",
            "options": [
                {
                    "__name": "Wohnort",
                    "url": "/wohnort/kreise.json"
                },
                {
                    "__name": "Arbeitsort",
                    "url": "/arbeitsort/kreise.json"
                }
            ],
            "query": {
                "type": "URL",
                "attr": "url",
                "dataType": "JSON"
            }
        },
        {
            "__title": "in Kreis",
            "__defaultOptionText": "Bitte Kreis wählen",
            "__helpText": "Wähle hier den Kreis",
            "attr": "name",
            "query": {
                "type": "URL",
                "attr": "url",
                "dataType": "JSON"
            }
        },
        {
            "__title": "in Gemeinde",
            "__defaultOptionText": "Bitte Gemeinde wählen",
            "__helpText": "Wähle hier die Gemeinde",
            "attr": "name",
            "query": {
                "type": "URL",
                "attr": "url",
                "dataType": "GeoJSON"
            }
        }
    ],
    "topMost": {
        "__title": "aber nur die",
        "__defaultOptionText": "Bitte einschränken",
        "__helpText": "Zeige nur die größten Gemeinden",
        "options": [5, 10, 15, 20, 30, 40, 50],
        "optionPrefix": "Größten"
    },
    "attrCount": "anzahl_pendler",
    "attrLegend": "name",
    "__legendUnit": "Personen",
    "steps": 50,
    "minPx": 5,
    "maxPx": 20,
    "showLineStringLayer": true
}
```

***

## animation.filter
Aus jedem Filter wird ein Dropdown erzeugt.
Folgende Inhalte sind konfigurierbar:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|title|ja|String||Titel. Wird über dem Dropdown angezeigt. Wird in der Sprachdatei festgelegt.|false|
|defaultOptionText|ja|String||Text der im initialen Dropdown als Inhalt steht. Dieser ist aber nicht auswählbar. Wird in der Sprachdatei festgelegt.|false|
|helpText|ja|String||Text der beim hovern über bzw. Klick auf das "?" angezeigt wird. Wird in der Sprachdatei festgelegt.|false|
|attr|ja|String||Attributname der im Dropdown angezeigt werden soll.|false|
|options|nein|**[option](#markdown-header-filteroption)**[]||Optionen die dynamisch aus den requests geparsed werden. AUSSNAHME: Beim obersten Filter müssen die options manuell gesetzt werden. Dadurch wird ein initialer request gespart.|false|
|query|nein|**[query](#markdown-header-filterquery)**||Query, die angibt wie die folgenden Dateninhalte abzurufen und zu parsen sind.|false|

**Beispiel**
```
#!json
{
    "__title": "Zeige mir alle Pendler an mit",
    "__defaultOptionText": "Bitte Ziel wählen",
    "__helpText": "Wähle hier das Ziel der Pendler",
    "attr": "name",
    "options": [
        {
            "__name": "Wohnort",
            "url": "/wohnort/kreise.json"
        },
        {
            "__name": "Arbeitsort",
            "url": "/arbeitsort/kreise.json"
        }
    ],
    "query": {
        "type": "URL",
        "attr": "url",
        "dataType": "JSON"
    }
}
```

***

## animation.filter.option
Eine Option ist ein Objekt, welche mindestens aus einer URL und einem weiteren Attribut bestehen muss, welches im Attribut "attr" eines Filters definiert ist. Der Inhalt des Attributes wird im dropdown angezeigt.
Beim Selektieren der Option wird die Url an die url des Werkzeugs angehängt und ein neuer Request erzeugt.
Dieser parsed mithilfe der **[query](#markdown-header-filterquery)** den Inhalt für das nächste Dropdown.


|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|url|ja|String||Titel der im Dropdown angezeigt wird.|false|

**Beispiel**
```
#!json
{
    "name": "Wohnort",
    "url": "/wohnort/kreise.json"
}
```

***

## animation.filter.query


|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|type|ja|enum["URL"]||Typ wie die zusammengesetzte url abzufragen ist.|false|
|attr|ja|String||Attributname des Attributes das für den Request verwendet werden soll.|false|
|dataType|ja|enum["JSON", "GeoJSON"]||Datentyp der definiert wie der Request geparsed wird.|false|

**Beispiel**
```
#!json
"query": {
    "type": "URL",
    "attr": "url",
    "dataType": "JSON"
}
```

***
