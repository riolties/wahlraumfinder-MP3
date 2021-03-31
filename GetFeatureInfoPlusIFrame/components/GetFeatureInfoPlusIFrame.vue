<script>
export default {
    name: "GetFeatureInfoPlusIFrame",
    props: {
        feature: {
            type: Object,
            required: true
        }
    },
    data: () => {
        return {
            iFrameUrls: []
        };
    },
    created () {
        console.log(this.feature);
        this.addIFrameUrls();
        console.log(this.iFrameUrls);
    },
    methods: {
        addIFrameUrls: function () {
            const props = this.feature.getProperties(),
                theme = this.feature.getTheme(),
                startsWith = typeof theme === "object" && theme.params.startsWith ? theme.params.startsWith : undefined;


            if (startsWith) {
                Object.keys(props).forEach(key => {
                    if (key.startsWith(startsWith)) {
                        this.iFrameUrls.push(props[key]);
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
