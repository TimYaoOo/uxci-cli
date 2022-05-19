<template>
  <section style="display: flex; flex-wrap: wrap">
    <Card v-for="i of data" :key="i.id" :info="i" :getInfo="getInfo" />
  <el-dialog
    title="提示111"
    :visible.sync="visiable"
    width="30%"
    :append-to-body="true"
    center>
    <span>需要注意的是内容是默认不居中的</span>
    <span slot="footer" class="dialog-footer">
      <el-button @click="centerDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="centerDialogVisible = false">确 定</el-button>
    </span>
  </el-dialog>
  </section>
</template>

<script>
import Card from "./components/card.vue";
var $encode = JSON.stringify;


export default {
  name: "App",
  components: {
    Card
  },
  data() {
    return {
      visiable: false,
      data:[],
	    info: {},
    }
  },
  methods: {
    getInfo(res) {
      this.visiable = true;
      this.info = res;
    },
    close() {
      this.visiable = false;
    },
    ajax(type, url, success, jsonData) {
        if (window.XMLHttpRequest) {
            var oajax = new XMLHttpRequest();
        } else {
            var oajax = new ActiveXObject("Microsoft.XMLHTTP")
        }
        switch (type.toLowerCase()) {
            case 'get':
                oajax.open(type, url, true);
                oajax.send($encode(jsonData))
                break;
            case 'post':
                oajax.open(type, url, true);
                oajax.setRequestHeader("content-Type", "application/json")
                oajax.setRequestHeader("X-Service-Id","demo.monitoringService")
                oajax.setRequestHeader("X-Service-Method","monitoringData")
                oajax.send($encode(jsonData))
                break;
        }
        oajax.onreadystatechange = function () {
            if (oajax.readyState == 4) {
                if (oajax.status == 200 || oajax.status == 304) {
                    success && success(JSON.parse(oajax.responseText))
                }
            }
        }
    }
  },
  mounted() {
    var that = this
    this.ajax("post", "http://localhost:8082/workspace/dst/test/vueexample/*.jsonRequest", function (res) {
            that.data = JSON.parse(res.body.body)
    },[])
  },
};
</script>

<style>
</style>
