define(['lib/hogan'], function(){
	return {
		check: $("<div />").html("&#10004;").html(),
		emptynotice: '<span class="notice">get started by adding a task</span>',
		pause: '<span class="iconic pause"></span>',
		play: '<span class="iconic play"></span>',
		task: window.Hogan.compile(
			'<div class="task row" data-task="{{id}}"><div class="el_b taskname">{{title}}</div><div class="el tasktime">{{time}}</div><div class="el button taskbutton controlbutton icon"><span class="iconic play"></span></div><div class="el button taskbutton deletebutton icon"><span class="iconic x"></span></div></div>')
	}
})
