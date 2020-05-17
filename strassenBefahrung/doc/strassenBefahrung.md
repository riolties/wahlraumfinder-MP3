# strassenBefahrung
Das Addon strassenBefahrung bindet die API von Infra3D (https://client.infra3d.ch/api/js/infra3dapi.js) ein. Das Addon wird dann in der Sidebar gerendered und lädt den Infra3d Client als IFrame.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String|"Straßen-Befahrung"|Name des Addons im Menu und im Titel.|false|
|glyphicon|nein|String|"glyphicon-road"|Glyphicon des Addons im Menu und im Titel.|false|
|user|nein|String|undefined|User für die Anmeldung im Infra3d-Client. Ist kein user und password angegeben erscheint eine Anmeldemaske.|false|
|password|nein|String|Password für die Anmeldung im Infra3d-Client. Ist kein user und password angegeben erscheint eine Anmeldemaske.|false|
|coords|nein|**[Coordinate](#markdown-header-datatypescoordinate)**|[691604, 5334760]|Startkoordinate für den Infra3d-Client.|false|
|styleId|nein|**[StyleId](#markdown-header-strassenbefahrungstyleid)**[]|[{id:"strassenBefahrung_woman", name: "Style: Woman"}]|Style-Definitionen für den Marker in der Karte.|false|

**Beispiel**
```
#!json
"strassenBefahrung": {
    "name": "AddOn:Straßen-Befahrung",
    "glyphicon": "glyphicon-road",
    "coords": [691604, 5334760],
    "styleId": [
        {
        "id": "strassenBefahrung_logo1",
        "name": "Logo1"
        },
        {
        "id": "strassenBefahrung_logo2",
        "name": "Logo2"
        }
    ],
    "user": "infra3d-User",
    "password": "infra3d-Password"
}
```


***

## strassenBefahrung.StyleId

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|ja|String||Id des styles. Der style mit dieser id muss in der style.json vorhanden sein.|false|
|name|ja|String||Names des Styles, der im Tool angegeben wird.|false|


**Beispiel**
```
#!json
{
    id: "strassenBefahrung_style1",
    name: "Style1"
}
```

***

# Datatypes
In diesem Kapitel werden die erwarteten Datentypen definiert.

## Datatypes.Coordinate

Eine Koordinate besteht aus einem Array bestehend aus zwei Zahlen. Die erste repräsentiert den Rechtswert, die zweite den Hochwert.

**Beispiel Koordinate bestehend aus Ganzzahlen(Integer)**
```
#!json
[561210, 5932600]
```

**Beispiel Koordinate bestehend aus Gleitkommazahlen(Float)**
```
#!json
[561210.1458, 5932600.12358]
```
