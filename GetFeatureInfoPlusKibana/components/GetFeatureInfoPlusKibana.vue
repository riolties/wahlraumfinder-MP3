<script>
export default {
    name: "GetFeatureInfoPlusKibana",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data: () => {
        return {
            kibanaUrls: [],
            mappedProps: {}
        };
    },
    created () {
        console.log(this.feature);
        this.mappedProps = this.feature.getMappedProperties();
        this.addKibanaUrls();
        console.log(this.kibanaUrls);
    },
    methods: {
        addKibanaUrls: function () {
            const props = this.feature.getProperties(),
                theme = this.feature.getTheme(),
                startsWith = typeof theme === "object" && theme.params.startsWith ? theme.params.startsWith : undefined;

            // fake data
            Object.assign(props, {kibana_url_temp: "https://foobar", kibana_url_luftfeuchte: "https:/barfoo"});
            console.log(props);

            if (startsWith) {
                console.log(startsWith);
                Object.keys(props).forEach(key => {
                    if (key.startsWith(startsWith)) {
                        this.kibanaUrls.push(props[key]);
                    }
                });
            }
        }
    }
};
</script>

<template>
    <div>
        foobar
    </div>
</template>
