# performanceTester
Das Addon performanceTester erzeugt Features um die Performance des Portals und des eingesetzten Browsers zu testen.
Dabei kann den Features auch eine definierte Höhe mitgegeben werden. Somit kann die Anwendug auch im 3D-Modus getestet werden.
Die Features können auch bewegte Daten simulieren.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String|"performanceTester"|Name des Addons im Menu und im Titel.|false|
|glyphicon|nein|String|"glyphicon-dashboard"|Glyphicon des Addons im Menu und im Titel.|false|
|numFeatures|nein|Number|1000|Initiale Anzahl der Features die erzeugt werden sollen.|false|
|extent|nein|**[Extent](#markdown-header-datatypesextent)**|[670000, 5320000, 710000, 5350000]|Extent in dem die Features generiert werden sollen.|false|
|height|nein|Number|600|Höhe, die den Features gegeben wird.|false|
|interval|nein|Number|2000|Interval der Bewegung in [ms], wenn diese im Tool aktiviert wird.|false|

**Beispiel**
```
#!json
"performanceTester": {
    "name": "AddOn:PerformanceTester",
    "glyphicon": "glyphicon-dashboard",
    "numFeatures": 1000,
    "extent": [670000, 5320000, 710000, 5350000],
    "height": 600,
    "interval": 2000
}
```

***


# Datatypes
In diesem Kapitel werden die erwarteten Datentypen definiert.

## Datatypes.Extent

Ein Extent besteht aus einem Array bestehend aus vier Zahlen. Ein Extent besschreibt einen rechteckigen Gültigkeitsbereich. Dabei wird ein Rechteck aufgespannt, das durch die "linke untere" und die "rechte obere" Ecke definiert wird. Das Schema lautet [Rechtswert-Links-Unten, Hochwert-Links-Unten, Rechtswert-Rechts-Oben, Hochwert-Rechts-Oben] oder [minx, miny, maxx, maxy].

**Beispiel Extent**
```
#!json
[510000.0, 5850000.0, 625000.4, 6000000.0]
```

***
