<template>
    <div class="customer-dialog-wrap" v-if="isVisiable" @click="close">
        <div class="dialog-container">
            <div class="dialog-container-header">
                <slot name="header"></slot>
            </div>
            <div class="dialog-container-content">
                <slot name="content"></slot>
            </div>
            <div class="dialog-container-footer">
                <slot name="footer"></slot>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        visiable: {
            type: Boolean,
            default:() => {
                return false;
            }
        },
        close: {
            type: Function
        }
    },
    data(){
        return {
            isVisiable: this.visiable
        }
    },
    methods: {
    },
    watch: {
        'visiable': function(n, o) {
            this.isVisiable = n;
        }
    }
}
</script>
    
<style>
    .customer-dialog-wrap {
        background-color: rgba(0, 0, 0, 0.2);
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 5000;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .dialog-container {
        width: 60%;
        background: #fff;
        min-height: 300px;
        border-radius: 6px;
        overflow: hidden;
    }
    .dialog-container-header {
        height: 30px;
        text-align: left;
        padding-left: 20px;
        line-height: 30px;
        background: #F6F7FA;
        font-size: 16px;
        color: #666;
        font-weight: 600;
    }
    .dialog-container-content {
        padding: 0 20px;
    }
</style>