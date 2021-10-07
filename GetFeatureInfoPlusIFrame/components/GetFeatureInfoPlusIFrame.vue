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
            iFrameUrls: [],
            dataTab: {
                key: "data",
                name: "Daten",
                isActive: true
            }
        };
    },
    created () {
        // console.log(this.feature);
        this.addIFrameUrls();
        // console.log(this.iFrameUrls);
    },
    methods: {
        addIFrameUrls: function () {
            const props = this.feature.getProperties(),
                theme = this.feature.getTheme(),
                themeParams = typeof theme === "object" && theme.params ? theme.params : undefined;


            if (themeParams) {
                Object.keys(themeParams).forEach(key => {
                    const value = props[key],
                        name = themeParams[key],
                        isActive = false;

                    if (value) {
                        this.iFrameUrls.push({key: key, value, name, isActive});
                    }
                });
            }
        },
        activateTab: function (evt) {
            const key = evt.currentTarget.value;

            this.iFrameUrls.forEach(iFrameObj => {
                if (iFrameObj.key === key) {
                    iFrameObj.isActive = true;
                }
                else {
                    iFrameObj.isActive = false;
                }
            });
            if (key === this.dataTab.key) {
                this.dataTab.isActive = true;
            }
            else {
                this.dataTab.isActive = false;
            }
        }
    }
};
</script>

<template>
    <div>
        <div
            id="tabs"
        >
            <div class="tabs btn-group btn-group-sm">
                <button
                    :value="dataTab.key"
                    class="btn btn-default"
                    :class="[dataTab.isActive === true ? 'active' : '']"
                    @click="activateTab"
                >
                    Daten
                </button>
                <button
                    v-for="iFrameObj in iFrameUrls"
                    :key="iFrameObj.key"
                    :value="iFrameObj.key"
                    class="btn btn-default"
                    :class="[iFrameObj.isActive === true ? 'active' : '']"
                    @click="activateTab"
                >
                    {{ iFrameObj.name }}
                </button>
            </div>

            <div class="content">
                <div
                    class="tabcontent"
                    :class="[dataTab.isActive === true ? '' : 'inactive']"
                >
                    <table
                        class="table table-hover"
                    >
                        <tbody>
                            <tr
                                v-for="(value, key) in feature.getMappedProperties()"
                                :key="key"
                            >
                                <td class="bold">
                                    {{ key }}
                                </td>
                                <td>
                                    {{ value }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div
                    v-for="iFrameObj in iFrameUrls"
                    :key="iFrameObj.key"
                    class="tabcontent"
                    :class="[iFrameObj.isActive === true ? '' : 'inactive']"
                >
                    <iframe
                        :title="iFrameObj.key"
                        :src="iFrameObj.value"
                        width="100%"
                        height="100%"
                    />
                </div>
            </div>
        </div>
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
.tabcontent.inactive {
    display: none;
}
</style>
