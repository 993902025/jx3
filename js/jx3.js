//global

	var c=0
	var t1,t2;
	var t;		//主Update线程
	var cur_cd_t = 0;		//当前cd
	var cur_gcd_t = 0;	//当前gcd
	var cur_sing_t = 0;
	
//玩家移动状态
var moveStatus = {
	free: 0,
	stand: 1,
	sit: 3,
	walk: 4,
	run: 5,
	jump: 6
}
//玩家施法状态
var castStatus = {
	none: 0,
	sing: 1,
	gnis: 2
}

var debufflist = new Array();

//
function DoGcd(s) {
	if(cur_gcd_t <= 0) {
		cur_gcd_t = 0;
		//console.log(cur_gcd_t / player.gcdtime * 100)
	}
	cur_gcd_t = cur_gcd_t - 40;
		$("#gcdprogressbar").progressbar({
		value: (cur_gcd_t / player.gcdtime * 100)
	});
}

//cd计时器
function ThreadDoCd(s) {
	this.ss = s; //<!--技能对象要引用到本地才能在后面用-->
	if(ss.curcd <= 0) {
		clearTimeout(ss.t_docd);
		$("div#cdtime").text(ss.curcd);
		ss.ifcd = true;
	} else {
		cur_cd_t = cur_cd_t - 0.1;
		ss.t_docd = setTimeout("ThreadDoCd(ss)", 100);
		$("div#cdtime").text(Math.abs(ss.cdtime - cur_cd_t).toFixed(1));
	}
	$("#gcdprogressbar").progressbar({
		value: (cur_cd_t / ss.cdtime * 100)
	});
}

//技能类
function Skill(id, name, cdtime, singtime, mindamage, maxdamage, crit) {
	this.id = id; //技能id
	this.name = name; //技能名
	this.cdtime = cdtime; //CD
	this.curcd = 0.0;
	this.mana = 20;
	this.distance = 20;
	this.ifsing = true; //是否读条
	this.singtime = singtime; //读条时间
	this.mindamage = mindamage; //最小伤害
	this.maxdamage = maxdamage; //最大伤害
	this.crit = crit; //暴击率
	this.notAllowedStatus = new Array(); //限制释放的状态--释放技能是要与玩家移动状态和debuff列表比对是否有重复项，如果有就拒绝释放
	this.ifcd = true;
	this.Reset = function() {
		this.ifcd = true;
	};
	this.max = 10;
	this.min = 5;
	this.t_docd;
	this.t_dosing;
	var self = this;

	init = function() {
		self.notAllowedStatus
	}
	init();

	//技能进入cd
	this.DoCd = function(obj) {
		obj.curcd = obj.cdtime;
		console.log("当进入cd，curcd=" + obj.curcd);
		ThreadDoCd(obj);
		//console.log("ifcd= "+obj.name+"|"+self.name);
	};

	//计算返回伤害
	this.dodamage = function() {
		_vsh = Math.floor(Math.random() * (self.maxdamage - self.mindamage + 1) + self.mindamage);
		//console.log("dodamage():" + _vsh);
		return _vsh;
	}

	//读条
	this.dosing = function(obj) {
		var _dmg = obj.dodamage(obj);
		console.log("dosing return:" + _dmg);

		return _dmg;
		//然后用这个去调读条UI的函数
	}

	//技能释放主函数
	this.domain = function(obj, player, target) {
		if(player.p_cast_status != castStatus.sing || player.p_cast_status == castStatus.gnis) {
			if(obj.curcd <= 0) //判断技能的当前cd是否合法
			{
				if(player.mana >= obj.mana) //判断技能的当前消耗mana是否合法
				{
					console.log("obj.distance=" + obj.distance)
					if(obj.distance > (player.vector2[0] - target.vector2[0])) //判断技能的当前释放距离distance是否合法
					{
						cur_gcd_t = player.gcdtime; //开启当前gcd值
						cur_sing_t = 0; //开启当前sing读条值
						player.isSing = true; //开启玩家的正在读条状态
						TimeToDoSing(cur_sing_t, obj, player, target);
						Tips("gcd=" + cur_gcd_t + " " + "singstatus=" + player.isSing + " " + "singt=" + cur_sing_t + " ");

						//							if ( dmg = obj.dosing(obj) )
						//							{
						//								obj.DoCd(obj);						
						//								return 0;
						//							}
						//							else
						//							{
						//							}							
						//self.t_dosing=setTimeout("clearTimeout(self.t_tosing);return dosing(obj);",obj.singtime*1000);							
						return 0;
					} else {
						return -4;
					}
				} else {
					return -3;
				}
			} else {
				return -2;
			}
		} else {
			return -1;
		}
	}

}

/**
 * 伤害统计类
 */
function DmgCount()
{
	this.totaldmg = 0;
	this.isfight = false;
	this.fightstarttime;
	this.fightendtime;
	this.fighttime = 0;
	this.startdmgsign = true;
	this.dps;
	this.maxdps;
	
	var self = this;
	
	self.fightstarttime = new Date();
	console.log("千万别进来");
	
	this.ComputeFigthTime = function()
	{
		//self.fightstarttime = t1;
		self.fightendtime = new Date();		//t2;		

		self.fighttime = ((self.fightendtime).getTime()-(self.fightstarttime).getTime()) / 1000;
		//console.log("战斗时间:" + self.fighttime + "=" + (self.fightendtime).getTime() + "-" + (self.fightstarttime).getTime() );	
	}
		
	/**
	 * 计算总场战斗总伤害
	 */
	this.counttotaldmg = function(v)
	{
		self.totaldmg = self.totaldmg + v;
		//console.log("总伤害:" + self.totaldmg);
	}
	
	/**
	 * 计算总场战斗DPS
	 */
	this.countdps = function()
	{
		if ( self.fighttime < 0.2 )
		{
			self.dps = self.totaldmg;
			self.dpsmax = self.dps;
		}
		else
		{
			self.dps = self.totaldmg/self.fighttime;
		}
		if ( self.dps > self.dpsmax )
		{
			self.dpsmax = self.dps;
		}
		_dpspercent = Math.round((self.dps / self.dpsmax * 10000)/100).toFixed(2);
		//console.log("dps:" + self.dps);
		//console.log("dps%:" + _dpspercent + "%");
		$("#dpsui").css("width",_dpspercent+"%");
		$("#dpsui").text(self.dps.toFixed(0) + "(" + _dpspercent + "%)");
	}
	
	//this.maxdps = 
		//return v/t;
}

/**
 * 玩家类
 */
function Player(id, name, maxlife, maxmana, skilllist) {
	this.id = id;
	this.name = name;
	this.maxlife = maxlife;
	this.maxmana = maxmana;
	this.life = maxlife;
	this.mana = maxmana;
	this.gcdtime = 1500; //gcd
	this.isSing = false;
	this.vector2;
	this.p_move_status = moveStatus.free;
	this.p_cast_status = castStatus.none;
	this.isfight = false;
	this.totaldmg = 0;
	
	this.skilllist = new Array();
	this.bufflist = new Array();
	this.castingskill = new Array();
	this.target = new Array();
	this.dmgcountlist = new Array();
	

	var self = this;
	this.init = function() {
		
	}
	/*//增加技能
	this.addskill = function(skill)
	{
		skilllist.push(skill);			
	}*/

	this.ReSetGcd = function() {
		self.isSing = false;
		cur_gcd_t = 0;
	}

	
	/**
	 * 计算伤害统计
	 */
	this.CountDmg = function(vdmg) {
		if (!self.isfight)
		{
			console.log("由非战斗进战" + self.isfight);
			self.isfight = true;
			var dmgcount = new DmgCount();
			self.dmgcountlist.push(dmgcount);
		}
		//console.log("dmgcounttime:" + self.dmgcountlist[0].fighttime + "and" + self.dmgcountlist[0].fighttime + "|||" + dmgcount);

		self.dmgcountlist[0].ComputeFigthTime();
		self.dmgcountlist[0].counttotaldmg(vdmg);
		self.dmgcountlist[0].countdps();
		
	}
		
	
	/**
	 * 读条
	 */
	this. ToDoSing = function(singt) {
		//self.slef = p;
		//console.log(singt + "?" + self.singtime)
		//console.log("timetodosing:"+self.castingskill[0].name);
		$("#singprogressbar").progressbar({
			value: (cur_sing_t / self.castingskill[0].singtime * 100)
		});
		if(singt >= self.castingskill[0].singtime) {
			_s = self.castingskill.shift(); 
			_dmg = _s.dodamage();
			self.isSing = false;
			Tips("使用技能[" + _s.name + "] 对 \"" + self.target[0].name + "\"造成 " + _dmg + " 点伤害." );
			self.CountDmg(_dmg);
			//return _dmg;
		}
		/*this.ss = s;
	        if (ss.ifcd)
	        {
	            clearTimeout(t2);
	            c = 0;
	            return;
	        }
	        $("big#time2").text(c);
	        console.log();
	        c=c+1;
	        t2=setTimeout("time2()",300);*/
	}

	
	/**
	 * 玩家施放技能
	 * 技能, 目标
	 */
	this.CastSkill = function(skill, target) {
		//	GetSkillList(); 从玩家的技能列表中获取对应的技能

		if(self.p_cast_status != castStatus.sing || self.p_cast_status == castStatus.gnis) {
			if(skill.curcd <= 0 & cur_gcd_t <= 0) //判断技能的当前cd是否合法
			{
				if(self.mana >= skill.mana) //判断技能的当前消耗mana是否合法
				{
					//console.log("skill.distance=" + skill.distance)
					if(skill.distance > (self.vector2[0] - target.vector2[0])) //判断技能的当前释放距离distance是否合法
					{
						cur_gcd_t = self.gcdtime; //开启当前gcd值
						cur_sing_t = 0; //开启当前sing读条值
						self.isSing = true; //开启玩家的正在读条状态
						self.castingskill[0] = skill;
						//self.castingskill.push(skill);
						self.target[0] = target;
						self.ToDoSing(cur_sing_t);
						//Tips("gcd=" + cur_gcd_t + " " + "singstatus=" + self.isSing + " " + "singt=" + cur_sing_t + " ");
						//self.t_dosing=setTimeout("clearTimeout(self.t_tosing);return dosing(skill);",skill.singtime*1000);							
						return 0;
					} else {
						return -4;
					}
				} else {
					console.log(self + "？？" + skill.mana);
					return -3;		//魔法不足
				}
			} else {
				return -2;		//技能cd 或 玩家gcd 没好
			}
		} else {
			return -1;		//玩家状态非法
		}
	}
	
	
}

function DoSkill(skill) {
	if(skill.ifcd == true) {
		//skill.intocd(skill);
		var shvalue = skill.domain(skill, player, target);
		var nowtime = new Date();
		console.log(nowtime);
		if(shvalue > 0) {
			var outstr = "使用了技能:" + skill.name + "\tCD:" + skill.cdtime + "|伤害为:" + shvalue;
			console.log(outstr);
			Tips(outstr);
			//$("div#time2").text(outstr);
		} else {
			var outstr = "使用了技能:" + skill.name + "obj.curcd > 0";
			Tips(outstr);
			//$("div#time2").text(outstr);

		}
	} else {
		console.log(skill.name + "冷却中……");
		var outstr = skill.name + "冷却中……"; // + $("div#time".text());
		$("div#time2").text(outstr);
	}
}

/**
 * 快捷键
 */
$(document).keydown(function(e) {
	if(e.which == 49) {
		player.CastSkill(skill1, target);
		//DoSkill(skill1);
	}
	if(e.which == 50) {
		//DoSkill(skill2);
		player.CastSkill(skill2, target);
	}
	if(e.which == 51) {
		;
		console.log(player.CastSkill(skill3,target));
	}
});

//<!--进度条-->
/**$(function() {
		$( "#gcdprogressbar" ).progressbar({
			value: 100
		});
	});
          
	  <!-- else if ( target.is( "#colorButton" ) ) {
        progressbarValue.css({
          "background": '#' + Math.floor( Math.random() * 16777215 ).toString( 16 )
        });
      } 
	  else if ( target.is( "#falseButton" ) ) {
        progressbar.progressbar( "option", "value", false );
      } -->**/

/**
 * 左下区域的文本提示显示
 */
function Tips(str) {
	//		_str = str;
	//		console.log("tips:-----------------------"  +  ($("textarea#textbox1").text()) + str);
	$("textarea#textbox1").text($("textarea#textbox1").text() + str + "\r");
	$("textarea").scrollTop($("textarea")[0].scrollHeight); //滚动到最后
	//		console.log()
}

function Test()
{
	var t1 = new Date();
	
	a = t1.getTime();
	var t2 = new Date();
	Tips(a);
}

function Start() {
	if(!gameSwitch) {
		gameSwitch = true;
		var time = new Date();
		console.log(time);
		Update(time);
		console.log("开始游戏!")
		Tips("开始游戏!");
		return;
	} else {
		gameSwitch = false;
		clearTimeout(t);
		console.log("停止/暂停游戏!");
		Tips("停止/暂停游戏!");
		return;
	}
}
var gameSwitch = false;
//
var k = 0;
//第一阶段将所有UI元素的数据更新并刷新UI

//cur_gcd_t = 1500;
function Update(lasttime) {
	
	this.thistime = new Date();;
	
	var str_t = this.thistime.getTime() - lasttime.getTime();
	//console.log(str_t); 
	var self = this;
	//console.log(cur_gcd_t/player.gcdtime*100)
	if( player.isSing ) {
		player.ToDoSing(cur_sing_t);
		cur_sing_t = cur_sing_t + 40 / 1000;
	}
	if(cur_gcd_t > 0) {		//gcd刷新
		DoGcd();
	}
	//func  遍历玩家技能列表刷新各技能cd情况
	//伤害统计
	if(player.isfight ){
			player.dmgcountlist[0].ComputeFigthTime();
			player.dmgcountlist[0].countdps();
	}
	t = setTimeout("Update(self.thistime)", 40);
}