// 解构
let { Component, PropTypes } = React;
let { render } = ReactDOM;
let { Router, Route, IndexRoute } = ReactRouter


//  定义混合类
class Util extends Component {
	/***
	 * ajax异步请求方法
	 * @url 	表示请求地址
	 * @fn 		表示请求回调函数
	 ****/
	ajax(url, fn) {
		let xhr = new XMLHttpRequest();
		// 订阅事件
		xhr.onreadystatechange = () => {
			// 判断状态
			if (xhr.readyState === 4) {
				// 判断状态码
				if (xhr.status === 200) {
					// 执行回调函数
					fn(JSON.parse(xhr.responseText))
				}
			}
		}
		// 打开请求
		xhr.open('GET', url, true);
		// 发送数据
		xhr.send(null);
	}
	/**
	 * 将对象转化成jquery
	 * @url 	表示地址
	 * @obj 	参数对象
	 * return 	query地址
	 **/
	objectToQuery(url, obj) {
		// 定义结果
		let result = '';
		// 遍历obj
		for (var i in obj) {
			// i 表示key， obj[i] 表示value
			result += '&' + i + '=' + obj[i]
		}
		// 从第二个开始截取
		return url + '?' + result.slice(1);
	}
}

// 定义列表页组件
class List extends Util {
	// 初始化状态
	constructor(props) {
		super(props)
		// 初始化状态
		this.state = {
			list: []
		}
	}
	createList() {
		return this.state.list.map((obj, index) => {
			return (
				<li key={index}>
					<a href={'#/detail/' + obj.id}>
						<img src={obj.img} alt="" />
						<div className="content">
							<h3>{obj.title}</h3>
							<p>
								<span>{obj.content}</span>
								<span className="list-comments">{'评论:' + obj.comment}</span>
							</p>
						</div>
					</a>
				</li>
			)
		})
	}
	render() {
		return (
			<section className="list">
				<ul>{this.createList()}</ul>
			</section>
		)
	}
	// 组件创建完成，拉取数据
	componentDidMount() {
		// 使用混合的方式
		this.ajax('data/list.json', res => {
			// 请求成功，存储list
			if (res && res.errno === 0) {
				// 更新状态
				this.setState({
					list: res.data
				})
			}
		})
	}
}
// 定义详情页组件
class Detail extends Util {
	// 定义构造函数
	constructor(props) {
		super(props);
		// 初始化状态
		this.state = {
			detail: {}
		}
	}
	componentDidMount() {
		// 请求数据
		this.ajax('data/detail.json?id=' + this.props.params.id, res => {
			// 数据返回成功
			if (res && res.errno === 0) {
				// 更新状态
				this.setState({
					detail: res.data
				})
			}
		})
	}
	render() {
		// 缓存变量
		let data = this.state.detail;
		// 定义内容
		let content = {
			__html: data.content
		}
		return (
			<section className="detail">
				<h1>{data.title}</h1>
				<p className="status"><span>{data.time}</span><span className="detail-comments">{'评论:' + data.comment}</span></p>
				<img src={data.img} alt="" />
				<p className="content" dangerouslySetInnerHTML={content}></p>
				<a className="btn" href={'#/comments/' + data.id}>查看更多评论</a>
			</section>
		)
	}
}
// 评论页组件
class Comments extends Util {
	// 初始化状态
	constructor(props) {
		// 构造函数继承
		super(props);
		// 初始化状态
		this.state = {
			// 用属性数据，初始化状态
			list: [],
			id: 0
		}
	}
	// 创建列表方法
	createList() {
		return this.state.list.map((obj, index) => {
			return (
				<li key={index}>
					<h3>{obj.user}</h3>
					<p>{obj.content}</p>
					<span>{obj.time}</span>
				</li>
			)
		})
	}
	// 提交事件回调函数
	submitComments() {
		//  为提交按钮绑定事件
		//  获取输入框的内容（信息）
		var val = this.refs.userInput.value;
		//  脏值检测（校验）,全是空白符和什么都没有输入都不合法
		if (/^\s*$/.test(val)) {
			// 校验失败：提示错误，阻止后面的操作
			alert('请输入数据！');
			return ;
		}
		//  校验成功：创建数据
		let date = new Date();
		let data = {
			id: this.state.id,
			user: 'absd',
			content: val,
			time: '刚刚 ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds()
		}
		//  发送请求，提交数据
		this.ajax(this.objectToQuery('data/addComment.json', data), res => {
			//  提交完成，提示用户
			if (res && res.errno === 0) {
				alert('success')
				//  提示完毕，显示内容
				// 更新状态
				let list = this.state.list;
				// 前叉数据
				list.unshift(data);
				// 更新数据
				this.setState({
					list: list
				})
				// 清空输入框
				this.refs.userInput.value = '';
			}
		})
	}
	render() {
		return (
			<section className="comments">
				<div className="input-box">
					{/*一会尝试约束性组件*/}
					<textarea ref="userInput" placeholder="文明上网，理性发言！"></textarea>
				</div>
				<div className="btn-box"><span onClick={this.submitComments.bind(this)} className="btn">提交</span></div>
				<ul>{this.createList()}</ul>
			</section>
		)
	}
	componentDidMount() {
		// 获取新闻id
		// 发送异步请求
		this.ajax('data/comment.json?id=' + this.props.params.id, res => {
			if (res && res.errno === 0) {
				// 更新状态（切换页面）
				this.setState({
					list: res.data.list,
					id: res.data.id
				})
			}
		})
	}
}

// 定义header类
class Header extends Component {
	// 点击返回按钮
	goBack() {
		// 让浏览器管理历史记录
		history.go(-1)
	}
	render() {
		let content = {__html: '<'};
		return (
			<div className="header">
				<div className="go-back" dangerouslySetInnerHTML={content} onClick={this.goBack.bind(this)}></div>
				<div className="login">登录</div>
				<h1>新闻平台</h1>
			</div>
		)
	}
}

// 定义组件
class App extends Util {
	// 渲染组件
	render() {
		return (
			<div>
				<Header></Header>
				{/*定义渲染位置*/}
				{this.props.children}
			</div>
		)
	}
}
//  定义规则
var routes = (
	<Router>
		<Route path="/" component={App}>
			<Route path="detail/:id" component={Detail}></Route>
			<Route path="comments/:id" component={Comments}></Route>
			<IndexRoute components={List}></IndexRoute>
		</Route>
	</Router>
)

// 渲染组件
//  渲染路由
render(routes,  document.getElementById('app'))