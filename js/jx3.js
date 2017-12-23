//global
	//玩家移动状态
	var moveStatus = 
	{
		free:0,
		stand:1,
		sit:3,
		walk:4,
		run:5,
		jump:6	
	}
	//玩家施法状态
	var castStatus = 
	{
		none:0,
		sing:1,
		gnis:2
	}
	
	var debufflist = new Array();
	
	//
	function DoGCd(s)
    {
    	$("#gcdprogressbar" ).progressbar({
					value: (cur_gcd_t/player.gcdtime*100)
				});
		if (cur_gcd_t <= 0)
		{
			cur_gcd_t = 1500;
		}
		cur_gcd_t = cur_gcd_t - 40;
    }
	
    //cd计时器
    function ThreadDoCd(s)
    {
		this.ss=s;		//<!--技能对象要引用到本地才能在后面用-->
        if (ss.curcd <= 0)
        {
            clearTimeout(ss.t_docd);            
            $("div#cdtime").text(ss.curcd);
			ss.ifcd=true;
        }
        else
        {
            cur_cd_t=cur_cd_t - 0.1;
            ss.t_docd=setTimeout("ThreadDoCd(ss)",100);
            $("div#cdtime").text(Math.abs(ss.cdtime - cur_cd_t).toFixed(1));
        }   	
		$( "#gcdprogressbar" ).progressbar({
			value: (cur_cd_t/ss.cdtime*100)
		});
    }

	//sing计时器
    function TimeToDoSing(t,o)
    {
    	this.obj=o;
    	if (t >= obj.singtime)
    	{
    		return obj.dodamage();
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
       
   	//技能类
    function Skill(id, name, cdtime, singtime, mindamage, maxdamage, crit)
    {
        this.id = id; //技能id
        this.name = name;		//技能名
        this.cdtime = cdtime;		//CD
        this.curcd = 0.0;
        this.mana = 20;
        this.distance = 20;
		this.ifsing = true;		//是否读条
		this.singtime = singtime;		//读条时间
		this.mindamage = mindamage;		//最小伤害
		this.maxdamage = maxdamage;		//最大伤害
		this.crit=crit;		//暴击率
		this.notAllowedStatus = new Array();		//限制释放的状态--释放技能是要与玩家移动状态和debuff列表比对是否有重复项，如果有就拒绝释放
        this.ifcd = true;
        this.Reset = function(){
            this.ifcd = true; 
            };
        this.max = 10;
		this.min = 5;
		this.t_docd;
		this.t_dosing;
		var self = this;
					
		init = function()
		{
			self.notAllowedStatus	
		}
		init();
		
		//技能进入cd
        this.DoCd = function(obj)
		{
			obj.curcd = obj.cdtime;
			console.log("当进入cd，curcd=" + obj.curcd);
            ThreadDoCd(obj);
            <!-- console.log("ifcd= "+obj.name+"|"+self.name); -->
        };
		
		//计算返回伤害
		this.dodamage = function(obj)
		{
			var vsh = Math.floor(Math.random()*(obj.maxdamage-obj.mindamage+1)+obj.mindamage);
			console.log("dodamage():"+ vsh);
			return vsh;				
		}
		
		//读条
		this.dosing = function(obj)
		{			
			var _dmg = obj.dodamage(obj);
			console.log("dosing return:" + _dmg);
			
			return _dmg;	
			//然后用这个去调读条UI的函数
		}
				
		//技能释放主函数
		this.domain = function(obj,player,target)
		{
			if (player.p_cast_status != castStatus.sing || player.p_cast_status == castStatus.gnis)
			{
				if (obj.curcd <= 0)		//判断技能的当前cd是否合法
				{
					if ( player.mana >= obj.mana )		//判断技能的当前消耗mana是否合法
					{
						console.log("obj.distance=" + obj.distance)
						if ( obj.distance > (player.vector2[0] - target.vector2[0]) )	//判断技能的当前释放距离distance是否合法
						{
							if ( dmg = obj.dosing(obj) )
							{
								obj.DoCd(obj);
								//return dmg;								
								return 0;
							}
							else
							{
								
							}							
							self.t_dosing=setTimeout("clearTimeout(self.t_tosing);return dosing(obj);",obj.singtime*1000);
							
							return 0;
						}
						else
						{
							return -4;
						}
					}
					else
					{
						return -3;
					}
				}
				else
				{
					return -2;
				}
			}
			else
			{
				return -1;
			}			
		}
			
    }
    
	//玩家类（）
    function Player(id, name, maxlife, maxmana, skilllist)
    {
		this.id = id;
		this.name = name;
		this.maxlife = maxlife;
		this.maxmana = maxmana;
		this.life = maxlife;
		this.mana = maxmana;
		this.gcdtime=1500;	//gcd
		this.isSing = false;
		this.vector2;
		this.p_move_status = moveStatus.free;
		this.p_cast_status = castStatus.none;
		
		this.skilllist = new Array();
		this.bufflist = new Array();
		
		this.init = function()
		{
			
		}
		/*//增加技能
		this.addskill = function(skill)
		{
			skilllist.push(skill);			
		}*/
		
		this.ReSetGcd = function()
		{
			cur_gcd_t = 0;
		}		
    }	
    
    function DoSkill(skill)
    {
        if ( skill.ifcd == true )
        {
            //skill.intocd(skill);
			var shvalue=skill.domain(skill,player,target);
			var nowtime = new Date();
			console.log(nowtime);
			if (shvalue > 0)
			{
	            var outstr = "使用了技能:"+skill.name+"\tCD:"+skill.cdtime+"|伤害为:"+shvalue;
	            console.log(outstr);
	            Tips(outstr);
				//$("div#time2").text(outstr);
			}
			else
			{
				var outstr = "使用了技能:"+skill.name+"obj.curcd > 0";
				 Tips(outstr);
				//$("div#time2").text(outstr);
				
			}
        }
        else
        {
            console.log(skill.name+"冷却中……");
			var outstr = skill.name+"冷却中……";<!-- + $("div#time".text());-->
			$("div#time2").text(outstr);	
        }
    }
    //<!-->加载and测试函数</!-->
	$(document).keydown(function(e){
		if(e.which == 49) {
			DoSkill(skill1);
		}
		if(e.which == 50) {
			DoSkill(skill2);
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


	//左下区域的文本提示显示
	function Tips(str)
	{
//		_str = str;
//		console.log("tips:-----------------------"  +  ($("textarea#textbox1").text()) + str);
		$("textarea#textbox1").text( $("textarea#textbox1").text() + str+ "\r");
		$("textarea").scrollTop($("textarea")[0].scrollHeight);//滚动到最后
//		console.log()
	}

	function Start()
	{
		if (!gameSwitch)
    	{
    		gameSwitch = true; 
    		Update();
    		console.log("开始游戏!")
    		return;
    	}
    	else
    	{
    		gameSwitch = false;
    		clearTimeout(t);
    		console.log("停止/暂停游戏!")
    		return;
    	}
	}
  	var gameSwitch = false;
	//
	var k = 1;
	//第一阶段将所有UI元素的数据更新并刷新UI
    	
		//cur_gcd_t = 1500;
	function Update()
    {
    	k = k + 1;
    	//console.log(cur_gcd_t/player.gcdtime*100)
    	if (player.isSing)
    	{
    		TimeToDoSing(cur_sing_t);
    		cur_sing_t = cur_sing_t + 40/1000;
    	}
      	if (cur_gcd_t != 0)
      	{
    		DoGCd();    		
      	}
    	
    	t=setTimeout("Update()",40);
    }
    
	
