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
            kibanaUrls: []
        };
    },
    created () {
        console.log(this.feature);
        this.addKibanaUrls();
        console.log(this.kibanaUrls);
    },
    methods: {
        addKibanaUrls: function () {
            const props = this.feature.getProperties(),
                theme = this.feature.getTheme(),
                startsWith = typeof theme === "object" && theme.params.startsWith ? theme.params.startsWith : undefined;

            // create fake data
            Object.assign(props, {kibana_url_temp: "https://foobar", kibana_url_luftfeuchte: "https:/barfoo"});

            if (startsWith) {
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
        <table
            class="table table-hover"
        >
            <tbody>
                <tr
                    v-for="(value, key) in feature.getMappedProperties()"
                    :key="key"
                >
                    <td class="bold">
                        {{ ($t(key)) }}
                    </td>
                    <td>
                        {{ value }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>


<style lang="less" scoped>
@import "~variables";

.table > tbody > tr > td {
    padding: 5px 8px;
    font-size: 12px;
    &.bold{
        font-family: @font_family_accent;
    }
}
</style>
