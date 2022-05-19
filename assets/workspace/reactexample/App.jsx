import "./App.css";
import Info from './components/Info'
import { Button, Table, Tag, Space, Modal, Radio } from 'antd';
import React, { Component } from "react";
class App extends Component {
  constructor(props) {
    super(props);
	
    this.state = {
      data: [],
	  isModalVisible: false,
	  selectedObj: {},
	  optionsWithDisabled: [
		{ label: '基本属性', value: '0' },
		{ label: '扩展属性', value: '1' },
		{ label: '业务属性', value: '2', },
	  ],
	  protoVal: '0'
    };
  }
  
  delItem(idx) {
    this.state.data.splice(idx, 1)
    this.setState({
      data: Array.from(this.state.data)
    })
  }
  forDetails(obj) {
	this.setState({
		selectedObj: obj,
	}, () => {
		this.setState({
			isModalVisible: true
		})
		console.log(this.state.selectedObj)

	})
    console.log('forDetails', obj["types"][this.state.protoVal]["properties"]);
  }
  setIsModalVisible(f) {
	this.setState({
		isModalVisible: f
	})
  }
  ajax(type, url, success, jsonData) {
	  var $encode = JSON.stringify;
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
			oajax.setRequestHeader("content-Type", "application/json")
			oajax.setRequestHeader("X-Service-Id","demo.moduleService")
			oajax.setRequestHeader("X-Service-Method","getModuleList")
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
  componentDidMount() {
	const _this = this;
	this.ajax("post", "http://localhost:8082/workspace/dst/test/reactexample/*.jsonRequest", function (res) {
		_this.setState({
		  data: JSON.parse(res.body.body)
		})
		console.log(JSON.parse(res.body.body))
	},[])
  }
  render() {
    const columns = [
      {
        title: 'id',
        dataIndex: 'id',
        key: 'id',
        width: 300,
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: 340,
      },
      {
        title: '类型',
        dataIndex: 'templateType',
        key: 'templateType',
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 200,
        render: (a, b, c) => {
          return (<Space size="middle">
          <a onClick={() => {this.forDetails(a)}}>查看</a>
          <a onClick={() => {this.delItem(c)}}>删除</a>
        </Space>)
        },
      },
    ]
    
    const {data, isModalVisible, protoVal, optionsWithDisabled, selectedObj} = this.state;
	const showModal = () => {
		this.setIsModalVisible(true);
	  };
	
	  const handleOk = () => {
		this.setIsModalVisible(false);
	  };
	
	  const handleCancel = () => {
		this.setIsModalVisible(false);
	  };
	  const onChange = e => {
		this.setState({
		  protoVal: e.target.value,
		});
	  };
	const infocolumns = [
		{
			title: '属性名称',
			dataIndex: 'deviceProperty',
			key: 'deviceProperty',
			width: 200,
			render:(i) => {
				return (
					<span>{i.name}</span>
				)
			}
		  },
		  {
			title: '标识符',
			dataIndex: 'deviceProperty',
			key: 'deviceProperty',
			width: 200,
			render:(i) => {
				return (
					<span>{i.symbol}</span>
				)
			}
		  },
		  {
			title: '默认值',
			dataIndex: 'deviceProperty',
			key: 'deviceProperty',
			width: 200,
			render:(i) => {
				return (
					<span>{i.precise}</span>
				)
			}
		  },
	]
    return (
      <div>
        <Table dataSource={data} columns={columns} rowKey="id" bordered></Table>
		<Modal title="查看" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} okText="确定" cancelText="取消" width="60%">
			<div style={{'display':'flex', 'justifyContent': 'center', 'flexWrap': 'wrap', 'flexDirection': 'column', 'alignItems': 'center'}}>
				<Radio.Group
					style={{marginBottom: '16px'}}
					options={optionsWithDisabled}
					onChange={(e)=> {onChange(e)}}
					value={protoVal}
					optionType="button"
					buttonStyle="solid"
				/>
				<Table dataSource={selectedObj["types"] ? selectedObj["types"][protoVal]["properties"] : []} columns={infocolumns} rowKey="symbol" bordered></Table>
			</div>
		</Modal>
      </div>
    );
  }
}

export default App;
