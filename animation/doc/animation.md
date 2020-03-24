# animation
Das Addon animation

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String|"performanceTester"|Name des Addons im Menu und im Titel.|false|
|glyphicon|nein|String|"glyphicon-dashboard"|Glyphicon des Addons im Menu und im Titel.|false|
|url|ja|String||Url auf den Datensatz.|false|
|dataType|nein|enum["GeoJSON"]|"GeoJSON"|Datentyp. Dort wird festgelegt wie die Daten geholt werden. Momentan kann nur eine JSON geholt werden.|false|
|classes|ja|**[class](#markdown-header-animationclass)**||Definition der Klassen, die die Richtung der Pendlerströme definiert. Es müssen 2 Klassen definiert sein.|false|
|topMost|nein|Number[]|[3, 5, 10]|Limitierung der gefundenen Features.|false|
|sort|nein|enum["asc", "desc"]|"desc"|Reihenfolge der Sortierung. "asc" für aufsteigend (ascending) und "desc" für absteigend (descending).|false|
|colors|nein|Array[]|[]|RGB oder RGBA Farbarrays. Farbdefinition für die Features und Legende. Sind keine Farben oder nicht genügend Farben definiert werden neue Farben generiert.|false|
|attrCount|nein|String|"anzahl_pendler"|Attribut für die anzuzeigende Anzahl.|false|
|steps|nein|Number|10|Anzahl der Schritte der Animation. Hier kann auch die Animationsdauer festgelegt werden. Steps / 10 entspricht ca. den Sekunden.|false|
|minPx|nein|Number|5|Mindestgröße der Punkte, die dargestellt werden sollen. Werte werden normiert.|false|
|maxPx|nein|Number|20|Maximalgröße der Punkte, die dargestellt werden sollen. Werte werden normiert.|false|
|showLineStringLayer|nein|Boolean|true|Flag die angibt ob die Linie angezeigt werden soll oder nicht.|false|

**Beispiel**
```
#!json
"animationAddOn": {
    "name": "AddOn:Animation",
    "glyphicon": "glyphicon-play-circle",
    "url": "url/to/json.json",
    "dataType": "GeoJSON",
    "classes": [
        {
        "name": "Wohnort",
        "levels": [
            {
            "title": "Kreis auswählen",
            "attr":"wohnort_kreis"
            },
            {
            "title": "Gemeinde auswählen",
            "attr":"wohnort"
            }
        ]
        },
        {
        "name": "Arbeitsort",
        "levels": [
            {
            "title": "Kreis auswählen",
            "attr":"arbeitsort_kreis"
            },
            {
            "title": "Gemeinde auswählen",
            "attr":"arbeitsort"
            }
        ]
        }
    ],
    "topMost": [3, 5, 10],
    "sort": "desc",
    "colors": [],
    "attrCount": "anzahl_pendler",
    "steps": 50,
    "minPx": 5,
    "maxPx": 20,
    "showLineStringLayer": true
}
```

***

## animation.class

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|String||Name der Klasse. Wird angezeigt im obersten Dropdown.|false|
|levels|ja|**[level](#markdown-header-animationclasslevel)**[]||Level für die Klassen. Jedes level steht für ein dropdown, das abhängig vom nächsthöheren Level ist.|false|

**Beispiel**
```
#!json
{
    "name": "Wohnort",
    "levels": [
        {
            "title": "Kreis auswählen",
            "attr":"wohnort_kreis"
        },
        {
            "title": "Gemeinde auswählen",
            "attr":"wohnort"
        }
    ]
}
```

***

## animation.class.level

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|title|ja|String||Titel der im Dropdown angezeigt wird.|false|
|attr|ja|String||Attributname der für dieses Level notwendig ist.|false|

**Beispiel**
```
#!json
{
    "title": "Gemeinde auswählen",
    "attr":"arbeitsort"
}
```

***
