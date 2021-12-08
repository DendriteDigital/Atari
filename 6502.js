var 
gLicense ="olc6502 - An emulation of the 6502/2A03 processor\n\n";
gLicense+="\"Thanks Dad for believing computers were gonna be a big deal...\" - javidx9\n\n";
gLicense+="License (OLC-3)\n";
gLicense+="~~~~~~~~~~~~~~~\n\n";
gLicense+="Copyright 2018-2019 OneLoneCoder.com\n\n";
gLicense+="Redistribution and use in source and binary forms,with or without\n";
gLicense+="modification,are permitted provided that the following conditions\n";
gLicense+="are met:\n\n";
gLicense+="1. Redistributions or derivations of source code must retain the above\n";
gLicense+="copyright notice,this list of conditions and the following disclaimer.\n\n";
gLicense+="2. Redistributions or derivative works in binary form must reproduce\n";
gLicense+="the above copyright notice. This list of conditions and the following\n";
gLicense+="disclaimer must be reproduced in the documentation and/or other\n";
gLicense+="materials provided with the distribution.\n\n";
gLicense+="3. Neither the name of the copyright holder nor the names of its\n";
gLicense+="contributors may be used to endorse or promote products derived\n";
gLicense+="from this software without specific prior written permission.\n\n";
gLicense+="THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS\n";
gLicense+="\"AS IS\" AND ANY EXPRESS OR IMPLIED WARRANTIES,INCLUDING,BUT NOT\n";
gLicense+="LIMITED TO,THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR\n";
gLicense+="A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT\n";
gLicense+="HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,INDIRECT,INCIDENTAL,\n";
gLicense+="SPECIAL,EXEMPLARY,OR CONSEQUENTIAL DAMAGES (INCLUDING,BUT NOT\n";
gLicense+="LIMITED TO,PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,\n";
gLicense+="DATA,OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY\n";
gLicense+="THEORY OF LIABILITY,WHETHER IN CONTRACT,STRICT LIABILITY,OR TORT\n";
gLicense+="(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE\n";
gLicense+="OF THIS SOFTWARE,EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n\n";
var 
gBackground ="Background\n";
gBackground+="~~~~~~~~~~\n";
gBackground+="I love this microprocessor. It was at the heart of two of my favourite\n";
gBackground+="machines,the BBC Micro,and the Nintendo Entertainment System,as well\n";
gBackground+="as countless others in that era. I learnt to program on the Model B,and\n";
gBackground+="I learnt to love games on the NES,so in many ways,this processor is\n";
gBackground+="why I am the way I am today.\n\n";
gBackground+="In February 2019,I decided to undertake a selfish personal project and\n";
gBackground+="build a NES emulator. Ive always wanted to,and as such I've avoided\n";
gBackground+="looking at source code for such things. This made making this a real\n";
gBackground+="personal challenge. I know its been done countless times,and very likely\n";
gBackground+="in far more clever and accurate ways than mine,but I'm proud of this.\n\n";
gBackground+="Datasheet: http://archive.6502.org/datasheets/rockwell_r650x_r651x.pdf\n\n";
gBackground+="Files: olc6502.myH, olc6502.cpp\n\n";
gBackground+="Translated from C++ to JavaScript by Gregory Scott Callen\n"
gBackground+="all in one go Wednesday, May 13, 2020\n\n"

var
gLinks ="Relevant Video:\n\n";
gLinks+="Links\n\n";
gLinks+="~~~~~\n\n";
gLinks+="YouTube:  https://www.youtube.com/javidx9\n\n";
gLinks+="          https://www.youtube.com/javidx9extra\n\n";
gLinks+="Discord:  https://discord.gg/WhwHUMV\n\n";
gLinks+="Twitter:  https://www.twitter.com/javidx9\n\n";
gLinks+="Twitch:   https://www.twitch.tv/javidx9\n\n";
gLinks+="GitHub:   https://www.github.com/onelonecoder\n\n";
gLinks+="Patreon:  https://www.patreon.com/javidx9\n\n";
gLinks+="Homepage: https://www.onelonecoder.com\n\n";
gLinks+="Author\n\n";
gLinks+="~~~~~~\n\n";
gLinks+="David Barr,aka javidx9,©OneLoneCoder 2019\n\n";
var hi,lo;
var a,x,y,pc,sp,sr,asmlow=0x10000,asmhigh=0;
var addr_abs,addr_rel,addr,oldpc;
var fetched,opcode,cycles;
var N=128,V=64,U=32,B=16,D=8,I=4,Z=2,C=1;
var gClock=99999999,gTime,gWait=99999999;
var gSystemBus=new Array(0xFFFF);
function aaClock()
{
	opcode=aaRead(pc);
	pc++;pc&=0xFFFF;
	cycles=lookup[opcode][3];
	additional_cycle1=lookup[opcode][2]();
	additional_cycle2=lookup[opcode][1]();
	cycles+=(additional_cycle1 & additional_cycle2);
	aaSetFlag(U,true);
	aaDisassemble(19,2);
	aaDrawCPU(2,2);
}
function aaComplete()
{
	return(cycles==0);
}
function aaCreate()
{
	// Load Program (assembled at https://www.masswerk.at/6502/assembler.html)
	/*
		*=$8000
		LDX #10
		STX $0000
		LDX #3
		STX $0001
		LDY $0000
		LDA #0
		CLC
		loop
		ADC $0001
		DEY
		BNE loop
		STA $0002
		NOP
		NOP
		NOP
	*/
	var addr;
	for(addr=0;addr<0xFFFF;addr++)
	{
		gSystemBus[addr]=0;
	}
	// Atari BASIC $A000 to $BFFF
	var l=0,b;
	l=0;myx=0;
	while(myx<gBASIC.length){
		addr=gBASIC[myx];
		for(b=0;b<=15;b++)
		{
			gSystemBus[addr+b]=gBASIC[myx+b+1];
		}
		l++;myx=l*17;
	}
	// Atari OS Revision B $D800 to $FFFF
	l=0;myx=0;
	while(myx<gOSB.length){
		addr=gOSB[myx];
		for(b=0;b<=15;b++)
		{
			gSystemBus[addr+b]=gOSB[myx+b+1];
		}
		l++;myx=l*17;
	}
	aaDrawRam(0);
	aaDrawRam(0x0100);
	aaDrawRam(pc-0x60);
	aaReset();
	return(true);
}
function aaDisassemble(horz,vert)
{
	var value,lo,hi,myline,oldline,str;
	var mapLines,sInst,asm;
	var redraw=false;
	if((pc<asmlow+5)||(pc>asmhigh-5)){
		redraw=true;
		aaDrawRam(pc-0x60);
		asmlow=pc-30;
	}
	asm=asmlow;
	while(vert<58){
		value=0x00;lo=0x00;hi=0x00;
		myline=(asm==pc);
		oldline=(asm==oldpc);
		mapLines="";sInst="";
		sInst=aaToHex(asm,4)+" ";
		opcode=aaRead(asm);asm++;
		opcode&=0xFF;
		sInst+=lookup[opcode][0]+" ";
		if(lookup[opcode][2]==IMP){
			//sInst+="IMP";
		}
		else if(lookup[opcode][2]==IMM){
			value=aaRead(asm,true);asm++;
			str="#$"+aaToHex(value,2);
			sInst+=str;
		}
		else if (lookup[opcode][2] == ZP0){
			lo = aaRead(asm,true); asm++;
			hi = 0x00;
			value = lo;
			str=aaLabel(value);
			if(str==-1)str="$"+aaToHex(value,2);
			sInst+=str;
		}
		else if (lookup[opcode][2] == ZPX){
			lo = aaRead(asm,true); asm++;
			hi = 0x00;
			value = lo;
			str=aaLabel(value);
			if(str==-1)str="$"+aaToHex(value,2);
			str+=",X";
			sInst+=str;
		}
		else if (lookup[opcode][2] == ZPY){
			lo = aaRead(asm,true); asm++;
			hi = 0x00;
			value = lo;
			str=aaLabel(value);
			if(str==-1)str="$"+aaToHex(value,2);
			str+=",Y";
			sInst+=str;
		}
		else if (lookup[opcode][2] == IZX){
			lo = aaRead(asm,true); asm++;
			hi = 0x00;
			value = lo;
			str=aaLabel(value);
			if(str==-1)str=aaToHex(value,2);
			sInst+="($"+str+",X)";
		}
		else if (lookup[opcode][2] == IZY){
			lo = aaRead(asm,true); asm++;
			hi = 0x00;
			value = lo;
			str=aaLabel(value);
			if(str==-1)str="($"+aaToHex(value,2);
			sInst+=str+"),Y";
		}
		else if (lookup[opcode][2] == ABS){
			lo = aaRead(asm,true); asm++;
			hi = aaRead(asm,true); asm++;
			value=(hi<<8)|lo;
			str=aaLabel(value);
			if(str==-1)str="$"+aaToHex(value,4);
			sInst+=str;
		}
		else if (lookup[opcode][2] == ABX){
			lo = aaRead(asm,true); asm++;
			hi = aaRead(asm,true); asm++;
			value=(hi<<8)|lo;
			str=aaLabel(value);
			if(str==-1)str="$"+aaToHex(value,4);
			str+=",X";
			sInst+=str;
		}
		else if (lookup[opcode][2] == ABY){
			lo = aaRead(asm,true); asm++;
			hi = aaRead(asm,true); asm++;
			value=(hi<<8)|lo;
			str=aaLabel(value);
			if(str==-1)str="$"+aaToHex(value,4);
			str+=",Y";
			sInst+=str;
		}
		else if (lookup[opcode][2] == IND){
			lo = aaRead(asm,true); asm++;
			hi = aaRead(asm,true); asm++;
			value=(hi<<8)|lo;
			str=aaLabel(value);
			if(str==-1)str="$"+aaToHex(value,4);
			str="("+str+")";
			sInst+=str;
		}
		else if (lookup[opcode][2] == REL)
		{
			value = aaRead(asm,true); asm++;
			if(value&0x80)value|=0xFF00;value=(asm+value)&0xFFFF;
			sInst += "$"+aaToHex(value,2)+" [$"+aaToHex(value,4)+"]";
		}
		sInst=" "+sInst;
		while(sInst.length<23)sInst+=" ";
		if(redraw){
			aaPrint(0xFFF,0x009,horz,vert,sInst);
		}
		if(oldline){
			aaPrint(0xFFF,0x009,horz,vert,sInst);
		}
		if(myline){
			aaPrint(0x009,0x0CC,horz,vert,sInst);
		}
		vert++;
	}
	oldpc=pc;
	asmhigh=asm;
}
function aaDrawByte(address,data,write)
{
	var num,col,row,mystr;
	if((address>=0x00)&&(address<0x100))
	{
		if(write){
			col=((address&0xF)*3)+50;
			row=((address>>4)&0xF)+2;
			num=" "+aaToHex(data,2)+" ";
			aaPrint(0xFFF,0x009,col,row,num);
		}
	}
	else if((address>=0x0100)&&(address<0x0200))
	{
		if(write){
			col=((address&0xF)*3)+50;
			row=((address>>4)&0xF)+20;
			num=" "+aaToHex(data,2)+" ";
			aaPrint(0xFFF,0x009,col,row,num);
		}
	}
	aaDrawOther(address,data,write);
}
function aaDrawCPU(horz,vert)
{
	aaPrint(0xFFF,0x000,horz,vert,"              ");vert++;
	aaPrint(0xFFF,0x000,horz,vert," SR: ");
	aaPrint(((sr & N)>0)?0x0F0:0xF00,0x000,horz+5,vert,"N");
	aaPrint(((sr & V)>0)?0x0F0:0xF00,0x000,horz+6,vert,"V");
	aaPrint(((sr & U)>0)?0x0F0:0xF00,0x000,horz+7,vert,"-");
	aaPrint(((sr & B)>0)?0x0F0:0xF00,0x000,horz+8,vert,"B");
	aaPrint(((sr & D)>0)?0x0F0:0xF00,0x000,horz+9,vert,"D");
	aaPrint(((sr & I)>0)?0x0F0:0xF00,0x000,horz+10,vert,"I");
	aaPrint(((sr & Z)>0)?0x0F0:0xF00,0x000,horz+11,vert,"Z");
	aaPrint(((sr & C)>0)?0x0F0:0xF00,0x000,horz+12,vert,"C ");
	aaPrint(0xFFF,0x000,horz,vert+1,"              ");
	horz++;
	aaPrint(0xFFF,0x009,horz,vert+3,"PC: $"+aaToHex(pc,4));
	aaPrint(0xFFF,0x009,horz,vert+4,"SP: $"+"01"+aaToHex(sp,2));
	aaPrint(0xFFF,0x009,horz,vert+5," A: $"+aaToHex(a,2)+"  ["+a+"]  ");
	aaPrint(0xFFF,0x009,horz,vert+6," X: $"+aaToHex(x,2)+"  ["+x+"]  ");
	aaPrint(0xFFF,0x009,horz,vert+7," Y: $"+aaToHex(y,2)+"  ["+y+"]  ");
}
function aaDrawOther(address,data,write)
{
	var mystr;
	aaScroll();
	mystr=" "+aaToHex(pc,4);
	mystr+=" "+aaToHex(address,4);
	mystr+=" "+aaToHex(data,2)+" ";
	if(write)aaPrint(0xFFF,0x009,2,12,mystr);
	else aaPrint(0xF00,0x000,2,12,mystr);
}
function aaDrawRam(address)
{
	var row,col;
	var sOffset="";
	address&=0xFFF0;
	for (row=0;row<16;row++)
	{
		sOffset+="$"+aaToHex(address,4)+":";
		for(col=0;col<16;col++)
		{
			sOffset+=" "+aaToHex(aaRead(address),2);
			address++;
		}
		sOffset+="\n";
	}
	if(address==0x100){
		aaPrint(0xFFF,0x009,44,2,sOffset);
	}else if(address==0x200){
		aaPrint(0xFFF,0x009,44,20,sOffset);
	}else{
		aaPrint(0xFFF,0x009,44,38,sOffset);
	}
}
function aaFetch()
{
	if (lookup[opcode][2]!=IMP)
		fetched=aaRead(addr_abs);
	return(fetched);
}
function aaGetFlag(flag)
{
	if((sr&flag)==0)
		return(false);
	else
		return(true);
}
function aaHighlight(horz,vert){
	var myx,myy,mychr,mystr,myline;
	for(myy=0;(vert+myy)<57;myy++){
		myline="";
		for(myx=0;myx<23;myx++){
			mychr=aaScreenGet(horz+myx,vert+myy);
			mychr&=0x7F;
			myline+=fromCharCode(mychr);
		}
		mystr=myline.substr(1,4);
		mystr=parseInt(mystr,16);
	}
}
function aaLabel(value){
	var i,r=-1;
	if ( value < 256) {
		for(i=0;i<gZPAGE.length;i++){
			if(gZPAGE[i][0]==value)r=gZPAGE[i][1];
		}
	}
	if (( value >= 0x200 )&&( value < 0x2FF )) {
		for(i=0;i<gPTWO.length;i++){
			if(gPTWO[i][0]==value)r=gPTWO[i][1];
		}
	}
	if (( value >= 0xD000 )&&( value < 0xDFFF )) {
		for(i=0;i<gHW.length;i++){
			if(gHW[i][0]==value)r=gHW[i][1];
		}
	}
	if ( value >= 0xE000 ) {
		for(i=0;i<gOS.length;i++){
			if(gOS[i][0]==value)r=gOS[i][1];
		}
	}
	return r;
}
function aaRead(address)
{	
	if(address==0xD01F)gWait=99999999;
	return(gSystemBus[address]&0xFF);
}
function aaReset()
{
	addr_abs = 0xFFFC;
	lo = aaRead(addr_abs + 0);
	hi = aaRead(addr_abs + 1);
	pc = (hi << 8) | lo;
	a = 251;
	x = 239;
	y = 0;
	sp = 0xFD;
	sr = 0x00 | U;
	addr_rel = 0x0000;
	addr_abs = 0x0000;
	fetched = 0x00;
	cycles = 8;
	aaDrawRam(0);
	aaDrawRam(0x0100);
	aaDrawRam(pc-0x80);
	aaDisassemble(19,2);
	aaDrawCPU(2,2);
	// gSystemBus[0xD01F]=0x08;
}
function aaReturn(){
	var c,s,address=0,data=0;
	if(((aaScreenGet(44,gVert)&0x7F)=="P".charCodeAt(0))&&
	((aaScreenGet(45,gVert)&0x7F)=="C".charCodeAt(0))){
		for(c=47;c<=50;c++){
			s=aaScreenGet(c,gVert)&0x7F;
			address<<=4;
			if((s>=48)&&(s<=57)){
				address+=(s-48);
			}else if((s>=65)&&(s<65+6)){
				address+=(s-55);
			}
		}
		pc=address;
		aaDrawCPU(2,2);
		aaDrawRam(pc-0x80);
		aaDisassemble(19,2);
		console.log("pc="+aaToHex(address,4));
	}else if(((aaScreenGet(44,gVert)&0x7F)=="S".charCodeAt(0))&&
	((aaScreenGet(45,gVert)&0x7F)=="P".charCodeAt(0))){
		for(c=47;c<=48;c++){
			s=aaScreenGet(c,gVert)&0x7F;
			address<<=4;
			if((s>=48)&&(s<=57)){
				address+=(s-48);
			}else if((s>=65)&&(s<65+6)){
				address+=(s-55);
			}
		}
		sp=address;
		aaDrawCPU(2,2);
		address+=0x100;
		console.log("sp="+aaToHex(address,4));
	}else if(((aaScreenGet(44,gVert)&0x7F)=="S".charCodeAt(0))&&
	((aaScreenGet(45,gVert)&0x7F)=="R".charCodeAt(0))){
		for(c=47;c<=48;c++){
			s=aaScreenGet(c,gVert)&0x7F;
			data<<=4;
			if((s>=48)&&(s<=57)){
				data+=(s-48);
			}else if((s>=65)&&(s<65+6)){
				data+=(s-55);
			}
		}
		console.log("SR="+aaToHex(data,2));
		sr=data;
		aaDrawCPU(2,2);
	}else if(((aaScreenGet(44,gVert)&0x7F)=="A".charCodeAt(0))&&
	((aaScreenGet(45,gVert)&0x7F)==" ".charCodeAt(0))){
		for(c=46;c<=47;c++){
			s=aaScreenGet(c,gVert)&0x7F;
			data<<=4;
			if((s>=48)&&(s<=57)){
				data+=(s-48);
			}else if((s>=65)&&(s<65+6)){
				data+=(s-55);
			}
		}
		console.log("A="+aaToHex(data,2));
		a=data;
		aaDrawCPU(2,2);
	}else if(((aaScreenGet(44,gVert)&0x7F)=="X".charCodeAt(0))&&
	((aaScreenGet(45,gVert)&0x7F)==" ".charCodeAt(0))){
		for(c=46;c<=47;c++){
			s=aaScreenGet(c,gVert)&0x7F;
			data<<=4;
			if((s>=48)&&(s<=57)){
				data+=(s-48);
			}else if((s>=65)&&(s<65+6)){
				data+=(s-55);
			}
		}
		console.log("X="+aaToHex(data,2));
		x=data;
		aaDrawCPU(2,2);
	}else if(((aaScreenGet(44,gVert)&0x7F)=="Y".charCodeAt(0))&&
	((aaScreenGet(45,gVert)&0x7F)==" ".charCodeAt(0))){
		for(c=46;c<=47;c++){
			s=aaScreenGet(c,gVert)&0x7F;
			data<<=4;
			if((s>=48)&&(s<=57)){
				data+=(s-48);
			}else if((s>=65)&&(s<65+6)){
				data+=(s-55);
			}
		}
		console.log("Y="+aaToHex(data,2));
		y=data;
		aaDrawCPU(2,2);
	}else{
		for(c=44;c<=47;c++){
			s=aaScreenGet(c,gVert)&0x7F;
			address<<=4;
			if((s>=48)&&(s<=57)){
				address+=(s-48);
			}else if((s>=65)&&(s<65+6)){
				address+=(s-55);
			}
		}
		for(c=49;c<=50;c++){
			s=aaScreenGet(c,gVert)&0x7F;
			data<<=4;
			if((s>=48)&&(s<=57)){
				data+=(s-48);
			}else if((s>=65)&&(s<65+6)){
				data+=(s-55);
			}
		}
		console.log("address="+aaToHex(address,4)+" data="+aaToHex(data,2));
		gSystemBus[address]=data;
		aaDrawByte(address,data,true);
	}
}
function aaScroll(){
	var myx,myy,temp,on,off,chr,from,to;
	for(myy=56;myy>11;myy--){
		for(myx=0;myx<19;myx++){
			from=gScreenData[(myy<<7)|myx];
			to=gScreenData[((myy+1)<<7)|myx];
			if(from==to)continue;
			chr=from&0xFF;
			off=(from>>8)&0xFFF;
			on=(from>>20)&0xFFF;
			aaScreenPut(on,off,chr,myx,myy+1);
		}
	}
}
function aaSetFlag(flag,value)
{
	if(value)
		sr|=flag;
	else
		sr&=~flag;
}

// Copyright © 2020 by Gregory Scott Callen
// All Rights Reserved.

function aaToDec(num,dig){
	var myr=parseInt(num);
	myr+="";
	while(dig>myr.length){
		myr=" "+myr;
	}
	return(myr);
}
function aaToHex(num,dig){
	var myR="";
	for(var n=0;n<dig;n++){
		myR=gHex.substr(num&15,1)+myR;
		num>>=4;
	}
	return(myR);
}
function aaWrite(address,data)
{
	write=false;
	if(address<0xA000){
		gSystemBus[address]=data&0xFF;
		write=true;
	}else if((address>=0xD000)&&(address<0xD800)){
		// if(address!=0xD01F){
		gSystemBus[address]=data&0xFF;
		write=true;
		// }
	}	
	aaDrawByte(address,data,write);
}
var ABS=function()
{
	lo=aaRead(pc);
	pc++;pc&=0xFFFF;
	hi=aaRead(pc);
	pc++;pc&=0xFFFF;
	addr_abs=(hi<<8)|lo;
	return(0);
}
var ABX=function()
{
	lo=aaRead(pc);
	pc++;pc&=0xFFFF;
	hi=aaRead(pc);
	pc++;pc&=0xFFFF;
	addr_abs=(hi<<8)|lo;
	addr_abs+=x;
	if((addr_abs&0xFF00)!=(hi<<8))
		return(1);
	else
		return(0);	
}
var ABY=function()
{
	lo=aaRead(pc);
	pc++;pc&=0xFFFF;
	hi=aaRead(pc);
	pc++;pc&=0xFFFF;
	addr_abs=(hi<<8)|lo;
	addr_abs+=y;
	if((addr_abs&0xFF00)!=(hi<<8))
		return(1);
	else
		return(0);
}
var ADC=function()
{
	aaFetch();
	temp=a+fetched+aaGetFlag(C);
	aaSetFlag(C,temp>255);
	aaSetFlag(Z,(temp&0x00FF)==0);
	aaSetFlag(V,(~(a^fetched)&(a^temp))&0x0080);
	aaSetFlag(N,temp&0x0080);
	a=temp&0x00FF;
	return(1);
}
var AND=function()
{
	aaFetch();
	a=a&fetched;
	aaSetFlag(Z,a==0x00);
	aaSetFlag(N,a&0x80);
	return(1);
}
var ASL=function()
{
	aaFetch();
	temp=fetched<<1;
	aaSetFlag(C,(temp&0xFF00)>0);
	aaSetFlag(Z,(temp&0x00FF)==0x00);
	aaSetFlag(N,temp&0x80);
	if(lookup[opcode][2]==IMP)
		a=temp&0x00FF;
	else
		aaWrite(addr_abs,temp&0x00FF);
	return(0);
}
var BCC=function()
{
	if(aaGetFlag(C)==false)
	{
		cycles++;
		addr_abs=(pc+addr_rel)&0xFFFF;
		if((addr_abs&0xFF00)!=(pc&0xFF00))
			cycles++;
		pc=addr_abs;
	}
	return(0);
}
var BCS=function()
{
	if(aaGetFlag(C)==1)
	{
		cycles++;
		addr_abs=(pc+addr_rel)&0xFFFF;
		if((addr_abs&0xFF00)!=(pc&0xFF00))
			cycles++;
		pc=addr_abs;
	}
	return(0);
}
var BEQ=function()
{
	if(aaGetFlag(Z)==1)
	{
		cycles++;
		addr_abs=(pc+addr_rel)&0xFFFF;
		if((addr_abs&0xFF00)!=(pc&0xFF00))
			cycles++;
		pc=addr_abs;
	}
	return(0);
}

var BIT=function()
{
	aaFetch();
	temp=a&fetched;
	aaSetFlag(Z,(temp&0x00FF)==0x00);
	aaSetFlag(N,fetched&(1<<7));
	aaSetFlag(V,fetched&(1<<6));
	return(0);
}
var BMI=function()
{
	if(aaGetFlag(N)==1)
	{
		cycles++;
		addr_abs=(pc+addr_rel)&0xFFFF;
		if((addr_abs&0xFF00)!=(pc&0xFF00))
			cycles++;
		pc=addr_abs;
	}
	return(0);
}
var BNE=function()
{
	if(aaGetFlag(Z)==0)
	{
		cycles++;
		addr_abs=(pc+addr_rel)&0xFFFF;
		if((addr_abs&0xFF00)!=(pc&0xFF00))cycles++;
		pc=addr_abs;
	}
	return(0);
}
var BPL=function()
{
	if(aaGetFlag(N)==0)
	{
		cycles++;
		addr_abs=(pc+addr_rel)&0xFFFF;
		if((addr_abs&0xFF00)!=(pc&0xFF00))cycles++;
		pc=addr_abs;
	}
	return(0);
}
var BRK=function()
{
	pc++;pc&=0xFFFF;
	aaSetFlag(I,1);
	aaWrite(0x0100+sp,(pc>>8)&0x00FF);
	sp--;sp&=0xFF;
	aaWrite(0x0100+sp,pc&0x00FF);
	sp--;sp&=0xFF;
	aaSetFlag(B,1);
	aaWrite(0x0100+sp,sr);
	sp--;sp&=0xFF;
	aaSetFlag(B,0);
	pc=aaRead(0xFFFE)|(aaRead(0xFFFF)<<8);
	return(0);
}
var BVC=function()
{
	if(aaGetFlag(V)==0)
	{
		cycles++;
		addr_abs=(pc+addr_rel)&0xFFFF;
		if((addr_abs&0xFF00)!=(pc&0xFF00))cycles++;
		pc=addr_abs;
	}
	return(0);
}
var BVS=function()
{
	if(aaGetFlag(V)==1)
	{
		cycles++;
		addr_abs=(pc+addr_rel)&0xFFFF;
		if((addr_abs&0xFF00)!=(pc&0xFF00))cycles++;
		pc=addr_abs;
	}
	return(0);
}
var CLC=function()
{
	aaSetFlag(C,false);
	return(0);
}
var CLD=function()
{
	aaSetFlag(D,false);
	return(0);
}
var CLI=function()
{
	aaSetFlag(I,false);
	return(0);
}
var CLV=function()
{
	aaSetFlag(V,false);
	return(0);
}
var CMP=function()
{
	aaFetch();
	temp=a-fetched;
	aaSetFlag(C,a>=fetched);
	aaSetFlag(Z,(temp&0x00FF)==0x0000);
	aaSetFlag(N,temp&0x0080);
	return(1);
}
var CPX=function()
{
	aaFetch();
	temp=x-fetched;
	aaSetFlag(C,x>=fetched);
	aaSetFlag(Z,(temp&0x00FF)==0x0000);
	aaSetFlag(N,temp&0x0080);
	return(0);
}
var CPY=function()
{
	aaFetch();
	temp=y-fetched;
	aaSetFlag(C,y>=fetched);
	aaSetFlag(Z,(temp&0x00FF)==0x0000);
	aaSetFlag(N,temp&0x0080);
	return(0);
}
var DEC=function()
{
	aaFetch();
	temp=fetched-1;
	aaWrite(addr_abs,temp&0x00FF);
	aaSetFlag(Z,(temp&0x00FF)==0x0000);
	aaSetFlag(N,temp&0x0080);
	return(0);
}
var DEX=function()
{
	x--;x&=0xFF;
	aaSetFlag(Z,x==0x00);
	aaSetFlag(N,x&0x80);
	return(0);
}
var DEY=function()
{
	y--;y&=0xFF;
	aaSetFlag(Z,y==0x00);
	aaSetFlag(N,y&0x80);
	return(0);
}
var EOR=function()
{
	aaFetch();
	a=a^fetched;	
	aaSetFlag(Z,a==0x00);
	aaSetFlag(N,a&0x80);
	return(1);
}
var IMM=function()
{
	addr_abs=pc++;	
	return(0);
}
var IMP=function()
{
	fetched=a;
	return(0);
}
var INC=function()
{
	aaFetch();
	temp=fetched+1;
	aaWrite(addr_abs,temp&0x00FF);
	aaSetFlag(Z,(temp&0x00FF)==0x0000);
	aaSetFlag(N,temp&0x0080);
	return(0);
}
var INX=function()
{
	x++;x&=0xFF;
	aaSetFlag(Z,x==0x00);
	aaSetFlag(N,x&0x80);
	return(0);
}
var INY=function()
{
	y++;y&=0xFF;
	aaSetFlag(Z,y==0x00);
	aaSetFlag(N,y&0x80);
	return(0);
}
var IND=function()
{
	ptr_lo=aaRead(pc);
	pc++;pc&=0xFFFF;
	ptr_hi=aaRead(pc);
	pc++;pc&=0xFFFF;
	ptr=(ptr_hi<<8)|ptr_lo;
	if(ptr_lo==0x00FF)
	{
		addr_abs=(aaRead(ptr&0xFF00)<<8)|aaRead(ptr);
	}
	else
	{
		addr_abs=(aaRead(ptr+1)<<8)|aaRead(ptr);
	}
	return(0);
}
var IRQ=function()
{
	if(aaGetFlag(I)==0)
	{
		aaWrite(0x0100+sp,(pc>>8)&0x00FF);
		sp--;sp&=0xFF;
		aaWrite(0x0100+sp,pc&0x00FF);
		sp--;sp&=0xFF;
		aaSetFlag(B,0);
		aaSetFlag(U,1);
		aaSetFlag(I,1);
		aaWrite(0x0100+sp,sr);
		sp--;sp&=0xFF;
		addr_abs=0xFFFE;
		lo=aaRead(addr_abs+0);
		hi=aaRead(addr_abs+1);
		pc=(hi<<8)|lo;
		cycles=7;
	}
}
var IZX=function()
{
	t=aaRead(pc);
	pc++;pc&=0xFFFF;
	lo=aaRead((t+x)&0x00FF);
	hi=aaRead((t+x+1)&0x00FF);
	addr_abs=(hi<<8)|lo;
	return(0);
}
var IZY=function()
{
	t=aaRead(pc);
	pc++;pc&=0xFFFF;
	lo=aaRead(t&0x00FF);
	hi=aaRead((t+1)&0x00FF);
	addr_abs=(hi<<8)|lo;
	addr_abs+=y;
	if((addr_abs&0xFF00)!=(hi<<8))
		return(1);
	else
		return(0);
}
var JMP=function()
{
	pc=addr_abs;
	return(0);
}
var JSR=function()
{
	pc--;
	aaWrite(0x0100+sp,(pc>>8)&0x00FF);
	sp--;sp&=0xFF;
	aaWrite(0x0100+sp,pc&0x00FF);
	sp--;sp&=0xFF;
	pc=addr_abs;
	return(0);
}
var LDA=function()
{
	aaFetch ();
	a = fetched;
	aaSetFlag(Z,a==0x00);
	aaSetFlag(N,a&0x80);
	return(1);
}
var LDX=function()
{
	aaFetch();
	x=fetched;
	aaSetFlag(Z,x==0x00);
	aaSetFlag(N,x&0x80);
	return(1);
}
var LDY=function()
{
	aaFetch();
	y=fetched;
	aaSetFlag(Z,y==0x00);
	aaSetFlag(N,y&0x80);
	return(1);
}
var LSR=function()
{
	aaFetch();
	aaSetFlag(C,fetched&0x0001);
	temp=fetched>>1;	
	aaSetFlag(Z,(temp&0x00FF)==0x0000);
	aaSetFlag(N,temp&0x0080);
	if(lookup[opcode][2]==IMP)
		a=temp&0x00FF;
	else
		aaWrite(addr_abs,temp&0x00FF);
	return(0);
}
var NMI=function()
{
	aaWrite(0x0100+sp,(pc>>8)&0x00FF);
	sp--;sp&=0xFF;
	aaWrite(0x0100+sp,pc&0x00FF);
	sp--;sp&=0xFF;
	aaSetFlag(B,0);
	aaSetFlag(U,1);
	aaSetFlag(I,1);
	aaWrite(0x0100+sp,sr);
	sp--;sp&=0xFF;
	addr_abs=0xFFFA;
	lo=aaRead(addr_abs+0);
	hi=aaRead(addr_abs+1);
	pc=(hi<<8)|lo;
	cycles=8;
}
var NOP=function()
{
	switch(opcode)
	{
		case 0x1C:
		case 0x3C:
		case 0x5C:
		case 0x7C:
		case 0xDC:
		case 0xFC:
			return(1);
			break;
	}
	return(0);
}
var ORA=function()
{
	aaFetch();
	a=a|fetched;
	aaSetFlag(Z,a==0x00);
	aaSetFlag(N,a&0x80);
	return(1);
}
var PHA=function()
{
	aaWrite(0x0100+sp,a);
	sp--;sp&=0xFF;
	return(0);
}
var PHP=function()
{
	aaWrite(0x0100+sp,sr|B|U);
	aaSetFlag(B,0);
	aaSetFlag(U,0);
	sp--;sp&=0xFF;
	return(0);
}
var PLA=function()
{
	sp++;
	a=aaRead(0x0100+sp);
	aaSetFlag(Z,a==0x00);
	aaSetFlag(N,a&0x80);
	return(0);
}
var PLP=function()
{
	sp++;
	sr=aaRead(0x0100+sp);
	aaSetFlag(U,1);
	return(0);
}
var REL=function()
{
	addr_rel=aaRead(pc);
	pc++;
	if(addr_rel&0x80)
		addr_rel=addr_rel|0xFF00;
	return(0);
}
var ROL=function()
{
	aaFetch();
	temp=(fetched<<1)|aaGetFlag(C);
	aaSetFlag(C,temp&0xFF00);
	aaSetFlag(Z,(temp&0x00FF)==0x0000);
	aaSetFlag(N,temp&0x0080);
	if(lookup[opcode][2]==IMP)
		a=temp&0x00FF;
	else
		aaWrite(addr_abs,temp&0x00FF);
	return(0);
}
var ROR=function()
{
	aaFetch();
	temp=(aaGetFlag(C)<<7)|(fetched>>1);
	aaSetFlag(C,fetched&0x01);
	aaSetFlag(Z,(temp&0x00FF)==0x00);
	aaSetFlag(N,temp&0x0080);
	if(lookup[opcode][2]==IMP)
		a=temp&0x00FF;
	else
		aaWrite(addr_abs,temp&0x00FF);
	return(0);
}
var RTI=function()
{
	sp++;sp&=0xFF;
	sr=aaRead(0x0100+sp);
	sr&=~B;
	sr&=~U;
	sp++;sp&=0xFF;
	pc=aaRead(0x0100+sp);
	sp++;sp&=0xFF;
	pc|=aaRead(0x0100+sp)<<8;
	return(0);
}

var RTS=function()
{
	sp++;sp&=0xFF;
	pc=aaRead(0x0100+sp);
	sp++;sp&=0xFF;
	pc|=aaRead(0x0100+sp)<<8;
	pc++;pc&=0xFFFF;
	return(0);
}
var SBC=function()
{
	aaFetch();
	value=(fetched)^0x00FF;
	temp=a+value+aaGetFlag(C);
	aaSetFlag(C,temp&0xFF00);
	aaSetFlag(Z,((temp&0x00FF)==0));
	aaSetFlag(V,(temp^a)&(temp^value)&0x0080);
	aaSetFlag(N,temp&0x0080);
	a=temp&0x00FF;
	return(1);
}
var SEC=function()
{
	aaSetFlag(C,true);
	return(0);
}
var SED=function()
{
	aaSetFlag(D,true);
	return(0);
}
var SEI=function()
{
	aaSetFlag(I,true);
	return(0);
}
var STA=function()
{
	aaWrite(addr_abs,a);
	return(0);
}
var STX=function()
{
	aaWrite(addr_abs,x);
	return(0);
}
var STY=function()
{
	aaWrite(addr_abs,y);
	return(0);
}
var TAX=function()
{
	x=a;
	aaSetFlag(Z,x==0x00);
	aaSetFlag(N,x&0x80);
	return(0);
}
var TAY=function()
{
	y=a;
	aaSetFlag(Z,y==0x00);
	aaSetFlag(N,y&0x80);
	return(0);
}
var TSX=function()
{
	x=sp;
	aaSetFlag(Z,x==0x00);
	aaSetFlag(N,x&0x80);
	return(0);
}
var TXA=function()
{
	a=x;
	aaSetFlag(Z,a==0x00);
	aaSetFlag(N,a&0x80);
	return(0);
}
var TXS=function()
{
	sp=x;
	return(0);
}
var TYA=function()
{
	a=y;
	aaSetFlag(Z,a==0x00);
	aaSetFlag(N,a&0x80);
	return(0);
}
var XXX=function()
{
	return(0);
}
var ZP0=function()
{
	addr_abs=aaRead(pc);	
	pc++;pc&=0xFFFF;
	addr_abs&=0x00FF;
	return(0);
}
var ZPX=function()
{
	addr_abs=(aaRead(pc)+x);
	pc++;pc&=0xFFFF;
	addr_abs&=0x00FF;
	return(0);
}
var ZPY=function()
{
	addr_abs=(aaRead(pc)+y);
	pc++;pc&=0xFFFF;
	addr_abs&=0x00FF;
	return(0);
}
var lookup=Array(
	["BRK",BRK,IMP,7],["ORA",ORA,IZX,6],["???",XXX,IMP,2],["???",XXX,IMP,8],// 00
	["???",NOP,IMP,3],["ORA",ORA,ZP0,3],["ASL",ASL,ZP0,5],["???",XXX,IMP,5],// 04
	["PHP",PHP,IMP,3],["ORA",ORA,IMM,2],["ASL",ASL,IMP,2],["???",XXX,IMP,2],// 08
	["???",NOP,IMP,4],["ORA",ORA,ABS,4],["ASL",ASL,ABS,6],["???",XXX,IMP,6],// 0C
	["BPL",BPL,REL,2],["ORA",ORA,IZY,5],["???",XXX,IMP,2],["???",XXX,IMP,8],// 10
	["???",NOP,IMP,4],["ORA",ORA,ZPX,4],["ASL",ASL,ZPX,6],["???",XXX,IMP,6],// 14
	["CLC",CLC,IMP,2],["ORA",ORA,ABY,4],["???",NOP,IMP,2],["???",XXX,IMP,7],// 18
	["???",NOP,IMP,4],["ORA",ORA,ABX,4],["ASL",ASL,ABX,7],["???",XXX,IMP,7],// 1C
	["JSR",JSR,ABS,6],["AND",AND,IZX,6],["???",XXX,IMP,2],["???",XXX,IMP,8],// 20
	["BIT",BIT,ZP0,3],["AND",AND,ZP0,3],["ROL",ROL,ZP0,5],["???",XXX,IMP,5],// 24
	["PLP",PLP,IMP,4],["AND",AND,IMM,2],["ROL",ROL,IMP,2],["???",XXX,IMP,2],// 28
	["BIT",BIT,ABS,4],["AND",AND,ABS,4],["ROL",ROL,ABS,6],["???",XXX,IMP,6],// 2C
	["BMI",BMI,REL,2],["AND",AND,IZY,5],["???",XXX,IMP,2],["???",XXX,IMP,8],// 30
	["???",NOP,IMP,4],["AND",AND,ZPX,4],["ROL",ROL,ZPX,6],["???",XXX,IMP,6],// 34
	["SEC",SEC,IMP,2],["AND",AND,ABY,4],["???",NOP,IMP,2],["???",XXX,IMP,7],// 38
	["???",NOP,IMP,4],["AND",AND,ABX,4],["ROL",ROL,ABX,7],["???",XXX,IMP,7],// 3C
	["RTI",RTI,IMP,6],["EOR",EOR,IZX,6],["???",XXX,IMP,2],["???",XXX,IMP,8],// 40
	["???",NOP,IMP,3],["EOR",EOR,ZP0,3],["LSR",LSR,ZP0,5],["???",XXX,IMP,5],// 44
	["PHA",PHA,IMP,3],["EOR",EOR,IMM,2],["LSR",LSR,IMP,2],["???",XXX,IMP,2],// 48
	["JMP",JMP,ABS,3],["EOR",EOR,ABS,4],["LSR",LSR,ABS,6],["???",XXX,IMP,6],// 4C
	["BVC",BVC,REL,2],["EOR",EOR,IZY,5],["???",XXX,IMP,2],["???",XXX,IMP,8],// 50
	["???",NOP,IMP,4],["EOR",EOR,ZPX,4],["LSR",LSR,ZPX,6],["???",XXX,IMP,6],// 54
	["CLI",CLI,IMP,2],["EOR",EOR,ABY,4],["???",NOP,IMP,2],["???",XXX,IMP,7],// 58
	["???",NOP,IMP,4],["EOR",EOR,ABX,4],["LSR",LSR,ABX,7],["???",XXX,IMP,7],// 5C
	["RTS",RTS,IMP,6],["ADC",ADC,IZX,6],["???",XXX,IMP,2],["???",XXX,IMP,8],// 60
	["???",NOP,IMP,3],["ADC",ADC,ZP0,3],["ROR",ROR,ZP0,5],["???",XXX,IMP,5],// 64
	["PLA",PLA,IMP,4],["ADC",ADC,IMM,2],["ROR",ROR,IMP,2],["???",XXX,IMP,2],// 68
	["JMP",JMP,IND,5],["ADC",ADC,ABS,4],["ROR",ROR,ABS,6],["???",XXX,IMP,6],// 6C
	["BVS",BVS,REL,2],["ADC",ADC,IZY,5],["???",XXX,IMP,2],["???",XXX,IMP,8],// 70
	["???",NOP,IMP,4],["ADC",ADC,ZPX,4],["ROR",ROR,ZPX,6],["???",XXX,IMP,6],// 74
	["SEI",SEI,IMP,2],["ADC",ADC,ABY,4],["???",NOP,IMP,2],["???",XXX,IMP,7],// 78
	["???",NOP,IMP,4],["ADC",ADC,ABX,4],["ROR",ROR,ABX,7],["???",XXX,IMP,7],// 7C
	["???",NOP,IMP,2],["STA",STA,IZX,6],["???",NOP,IMP,2],["???",XXX,IMP,6],// 80
	["STY",STY,ZP0,3],["STA",STA,ZP0,3],["STX",STX,ZP0,3],["???",XXX,IMP,3],// 84
	["DEY",DEY,IMP,2],["???",NOP,IMP,2],["TXA",TXA,IMP,2],["???",XXX,IMP,2],// 88
	["STY",STY,ABS,4],["STA",STA,ABS,4],["STX",STX,ABS,4],["???",XXX,IMP,4],// 8C
	["BCC",BCC,REL,2],["STA",STA,IZY,6],["???",XXX,IMP,2],["???",XXX,IMP,6],// 90
	["STY",STY,ZPX,4],["STA",STA,ZPX,4],["STX",STX,ZPY,4],["???",XXX,IMP,4],// 94
	["TYA",TYA,IMP,2],["STA",STA,ABY,5],["TXS",TXS,IMP,2],["???",XXX,IMP,5],// 98
	["???",NOP,IMP,5],["STA",STA,ABX,5],["???",XXX,IMP,5],["???",XXX,IMP,5],// 9C
	["LDY",LDY,IMM,2],["LDA",LDA,IZX,6],["LDX",LDX,IMM,2],["???",XXX,IMP,6],// A0
	["LDY",LDY,ZP0,3],["LDA",LDA,ZP0,3],["LDX",LDX,ZP0,3],["???",XXX,IMP,3],// A4
	["TAY",TAY,IMP,2],["LDA",LDA,IMM,2],["TAX",TAX,IMP,2],["???",XXX,IMP,2],// A8
	["LDY",LDY,ABS,4],["LDA",LDA,ABS,4],["LDX",LDX,ABS,4],["???",XXX,IMP,4],// AC
	["BCS",BCS,REL,2],["LDA",LDA,IZY,5],["???",XXX,IMP,2],["???",XXX,IMP,5],// B0
	["LDY",LDY,ZPX,4],["LDA",LDA,ZPX,4],["LDX",LDX,ZPY,4],["???",XXX,IMP,4],// B4
	["CLV",CLV,IMP,2],["LDA",LDA,ABY,4],["TSX",TSX,IMP,2],["???",XXX,IMP,4],// B8
	["LDY",LDY,ABX,4],["LDA",LDA,ABX,4],["LDX",LDX,ABY,4],["???",XXX,IMP,4],// BC
	["CPY",CPY,IMM,2],["CMP",CMP,IZX,6],["???",NOP,IMP,2],["???",XXX,IMP,8],// C0
	["CPY",CPY,ZP0,3],["CMP",CMP,ZP0,3],["DEC",DEC,ZP0,5],["???",XXX,IMP,5],// C4
	["INY",INY,IMP,2],["CMP",CMP,IMM,2],["DEX",DEX,IMP,2],["???",XXX,IMP,2],// C8
	["CPY",CPY,ABS,4],["CMP",CMP,ABS,4],["DEC",DEC,ABS,6],["???",XXX,IMP,6],// CC
	["BNE",BNE,REL,2],["CMP",CMP,IZY,5],["???",XXX,IMP,2],["???",XXX,IMP,8],// D0
	["???",NOP,IMP,4],["CMP",CMP,ZPX,4],["DEC",DEC,ZPX,6],["???",XXX,IMP,6],// D4
	["CLD",CLD,IMP,2],["CMP",CMP,ABY,4],["NOP",NOP,IMP,2],["???",XXX,IMP,7],// D8
	["???",NOP,IMP,4],["CMP",CMP,ABX,4],["DEC",DEC,ABX,7],["???",XXX,IMP,7],// DC
	["CPX",CPX,IMM,2],["SBC",SBC,IZX,6],["???",NOP,IMP,2],["???",XXX,IMP,8],// E0
	["CPX",CPX,ZP0,3],["SBC",SBC,ZP0,3],["INC",INC,ZP0,5],["???",XXX,IMP,5],// E4
	["INX",INX,IMP,2],["SBC",SBC,IMM,2],["NOP",NOP,IMP,2],["???",SBC,IMP,2],// E8
	["CPX",CPX,ABS,4],["SBC",SBC,ABS,4],["INC",INC,ABS,6],["???",XXX,IMP,6],// EC
	["BEQ",BEQ,REL,2],["SBC",SBC,IZY,5],["???",XXX,IMP,2],["???",XXX,IMP,8],// F0
	["???",NOP,IMP,4],["SBC",SBC,ZPX,4],["INC",INC,ZPX,6],["???",XXX,IMP,6],// F4
	["SED",SED,IMP,2],["SBC",SBC,ABY,4],["NOP",NOP,IMP,2],["???",XXX,IMP,7],// F8
	["???",NOP,IMP,4],["SBC",SBC,ABX,4],["INC",INC,ABX,7],["???",XXX,IMP,7]  // FC
);

// End of File - Jx9 

