#WahllokalFinder

Dieses Werkzeug reagiert auf einen Klick in der Vorschlagsliste des Suchschlitzes.
Die Koordinate des Suchtreffers wird verwendet um einen getFeatureInfo-Request auf den Address-Layer("addressLayerId") zu generieren.

Aus diesem Ergebnis-Feature wird das Wahllokal-Attribut ("addressLayerPollingStationAttribute") extrahiert und explizit dieses Feature vom Wahllokal WFS-Layer ("pollingStationLayerId") bezogen.

In der Karte werden kann die Adresse, das zuständige Wahllokal und die Distanz in Luftlinie dargestellt.

Die Attribute des Wahllokals werden in der Sidebar dargestellt.
Mobil ist die Sidebar minimierbar und leicht transparent.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String|"Wahllokalfinder"|Name des Tools.|nein|
|glyphicon|nein|String|"glyphicon-list"|CSS-Klasse des Glyphicons.|nein|
|isVisibleInMenu|ja|Boolean||Flag die angibt ob das Werkzeug in den Werkzeugen sichtbar ist.|nein|
|addressLayerId|ja|String|'""'|Id des Address Layers.|nein|
|addressLayerPollingStationAttribute|ja|String|'""'|Attribut des Wahllokals im Address Layer.|nein|
|pollingStationLayerId|ja|String|'""'|Id des Wahllokal Layers.|nein|
|**[attributesToMap](#markdown-header-attributestomap)**|nein|Object||Objekt um Werte zu mappen.|nein|
|featureAttributes|nein|Object|{}|Objekt zum Attribut Mapping. Bestehend aus Key-Value-Paaren.|nein|
|mailTo|nein|String|'""'|Email-adresse die als Mail to bei Störungen angegeben wird.|nein|

**Beispiel**
```
#!json
"wahllokalFinder": {
    "name": "Wahllokalfinder",
    "glyphicon": "glyphicon-list",
    "mergeByCoordinates": true,
    "attributesToMap": {
        "eigner": [
            {
                "value": "parseInt"
            }
        ],
        "wbz": [
            {
                "value": "parseInt"
            }
        ],
        "stbz": [
            {
                "value": "parseInt"
            }
        ],
        "plz": [
            {
                "value": "parseInt"
            }
        ],
        "rollstuhlfahrende": [
        {
                "value": ["", "undefined"],
                "mappedValue": "Ja"
        },
        {
                "value": "1",
                "mappedValue": "Nein"
        }
        ],
        "gehbehinderte": [
        {
                "value": ["", "undefined"],
                "mappedValue": "Ja"
        },
        {
                "value": "1",
                "mappedValue": "Nein"
        }
        ],
        "sehbeeintraechtigte": [
        {
                "value": ["", "undefined"],
                "mappedValue": "Ja"
        },
        {
                "value": "1",
                "mappedValue": "Nein"
        }
        ],
        "blinde": [
        {
                "value": ["", "undefined"],
                "mappedValue": "Ja"
        },
        {
                "value": "1",
                "mappedValue": "Nein"
        }
        ],
        "kognitiv_beeintraechtigte": [
        {
                "value": ["", "undefined"],
                "mappedValue": "Ja"
        },
        {
                "value": "1",
                "mappedValue": "Nein"
        }
        ]
    },
    "isVisibleInMenu": false,
    "addressLayerId": "2",
    "addressLayerPollingStationAttribute": "kommunalwahl",
    "pollingStationLayerId": "3",
    "featureAttributes": {
        "wahllokal_name": "Name",
        "stranam": "Straße",
        "nr": "Hausnummer",
        "wbz": "Stimmbezirk",
        "stbz": "Stadtbezirk",
        "blinde": "Geeignet für Blinde",
        "gehbehinderte": "Geeignet für Gehbehinderte",
        "kognitiv_beeintraechtigte": "Geeignet für Kognitiv Beeinträchtigte",
        "rollstuhlfahrende": "Geeignet für Rollstuhlfahrende",
        "sehbeeintraechtigte": "Geeignet für Sehbeeinträchtigte"
    },
    "mailTo": "geoportal@muenchen.de"
}
```

## attributesToMap ##

In diesem Objekt wird ein value Mapping vorgenommen.
Jeder "key" steht für ein Attribut des features.
Als "value" steht ein Array, das die mapping Parameter enthält

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|[Attributname]|nein|**[attributeMapping](#markdown-header-attributemapping)**[]||Mapping des Attributes.|nein|


**Beispiel 1**
```
#!json
"rollstuhlfahrende": [
    {
            "value": ["", "undefined"],
            "mappedValue": "Ja"
    },
    {
            "value": "1",
            "mappedValue": "Nein"
    }
]
```

**Beispiel 2**
```
#!json
"eigner": [
    {
        "value": "parseInt"
    }
]
```


## attributeMapping ##

Das attributMapping ist ein Objekt, das die Eingangswerte enthält und die Mappingwerte.
Hat das Feature-Attribut den Wert in "value", wird dieser überschrieben mit dem "mappedValue".
ACHTUNG Ausnahmen:
"undefined": Bei "undefined" wird gepfüft ob der Wert existiert. Falls ja wird der MappedValue verwendet.
"parseInt": Bei "parseInt" wird der Wert als Integer geparsed. Falls der Wert nicht geparsed werden kann, wird der Originalwert verwendet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|value|ja|String/String[]||Eingangswert/e.|nein|
|mappedValue|ja|String||Ausgangswert.|nein|

**Beispiel 1**
```
#!json
{
    "value": "1",
    "mappedValue": "Nein"
}
```

**Beispiel 2 mit "undefined"**
```
#!json
{
    "value": ["", "undefined"],
    "mappedValue": "Ja"
}
```

**Beispiel 3 mit "parseInt"**
```
#!json
{
    "value": "parseInt"
}
```