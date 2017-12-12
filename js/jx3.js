
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
            curcd=curcd - 0.1;
            ss.t_docd=setTimeout("timedCount(ss)",100);
            $("div#cdtime").text(Math.abs(ss.cdtime - cur_cd_t).toFixed(1));
        }   	
		$( "#gcdprogressbar" ).progressbar({
			value: (cur_cd_t/ss.cdtime*100)
		});
    }

	//sing计时器
    function TimeToDoSing(s)
    {
    	this.ss = s;
        if (ss.ifcd)
        {
            clearTimeout(t2);
            c = 0;
            return;
        }
        $("big#time2").text(c);
        console.log();
        c=c+1;
        t2=setTimeout("time2()",300);
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
        this.ifcd = true;
        this.Reset = function(){
            this.ifcd = true; 
            };
        this.max = 10;
		this.min = 5;
		this.t_docd;
		this.t_dosing;
		var self = this;
		
		
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
			var vsh = Math.floor(Math.random()*(obj.max-obj.min+1)+obj.min);
			return vsh;				
		}
		
		//读条
		this.dosing = function(obj)
		{			
			obj.DoCd(obj);
			var _dmg = dodamage();
			console.log("dosing return:" + dmg);
			
			return dmg;	
			//然后用这个去调读条UI的函数
		}
				
		//技能释放主函数
		this.domain = function(obj,player,target)
		{
			
			if (obj.curcd <= 0)		//判断技能的当前cd是否合法
			{
				if ( player.mana >= obj.mana )		//判断技能的当前消耗mana是否合法
				{
					console.log("obj.distance=" + obj.distance)
					if ( obj.distance > (player.vector2[0] - target.vector2[0]) )	//判断技能的当前释放距离distance是否合法
					{
						if (obj.dosing(obj))
						{
							obj.DoCd(obj);
							
						}
						else
						{
							
						}
						
						self.t_dosing=setTimeout("clearTimeout(self.t_tosing);return dosing(obj);",obj.singtime*1000);
						
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
		this.skilllist = new Array();
		this.vector2;
		//增加技能
		this.addskill = function(skill)
		{
			skilllist.push(skill);
			
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
            console.log("使用了技能:"+skill.name+"\tCD:"+skill.cdtime+"|伤害为:"+shvalue);
			var outstr = "使用了技能:"+skill.name+"\tCD:"+skill.cdtime+"|伤害为:"+shvalue;
			$("div#time2").text(outstr);			
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
			doskill(skill1);
		}
		if(e.which == 81) {
			doskill(skill1);
		}
	});

	
	//<!--进度条-->
	$(function() {
		$( "#gcdprogressbar" ).progressbar({
			value: 100
		});
	});
          
	  /**<!-- else if ( target.is( "#colorButton" ) ) {
        progressbarValue.css({
          "background": '#' + Math.floor( Math.random() * 16777215 ).toString( 16 )
        });
      } 
	  else if ( target.is( "#falseButton" ) ) {
        progressbar.progressbar( "option", "value", false );
      } -->**/

  
	$(function() {
		$( "#singprogressbar" ).progressbar({
			value: 100
		});
	});
  
	//
	//第一阶段将所有UI元素的数据更新并刷新UI
	/*function Update()
    {
    	console.log($("*").text());
    	if ( action )
    	{
    		
    		action == null;
    	}
    	
    	//t=setTimeout("Update()",40);
    }*/