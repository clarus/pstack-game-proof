"""Draw an original pixel poster using only the Python standard library."""
import struct
import sys
import zlib
from pathlib import Path
w,h=640,360
pixels=bytearray(bytes.fromhex('172923')*(w*h))
def rect(x,y,width,height,color):
    rgb=bytes.fromhex(color)
    for row in range(max(0,y),min(h,y+height)):
        for col in range(max(0,x),min(w,x+width)):
            pos=(row*w+col)*3; pixels[pos:pos+3]=rgb
for y in range(90,300,28):
    for x in range(-32,640,64):rect(x+(y//28%2)*32+1,y+1,61,25,'34483c')
rect(0,300,640,60,'1b3027')
rect(271,140,98,160,'6e7652');rect(283,124,74,176,'6e7652');rect(294,113,52,187,'6e7652')
rect(285,148,70,152,'101f1c');rect(297,136,46,164,'101f1c');rect(336,235,7,7,'edc779')
for x in [210,420]:rect(x,197,5,29,'835b40');rect(x-4,183,13,18,'d2854e');rect(x-1,178,7,18,'edc779')
rect(144,255,28,37,'c9704c');rect(149,243,18,20,'c9704c');rect(153,251,12,10,'f1e6c7');rect(157,254,2,3,'172923')
font={
'P':['11110','10001','10001','11110','10000','10000','10000'],'R':['11110','10001','10001','11110','10100','10010','10001'],
'O':['01110','10001','10001','10001','10001','10001','01110'],'F':['11111','10000','10000','11110','10000','10000','10000'],
'Q':['01110','10001','10001','10001','10101','10010','01101'],'U':['10001','10001','10001','10001','10001','10001','01110'],
'E':['11111','10000','10000','11110','10000','10000','11111'],'S':['01111','10000','10000','01110','00001','00001','11110'],
'T':['11111','00100','00100','00100','00100','00100','00100'],'C':['01111','10000','10000','10000','10000','10000','01111'],
'A':['01110','10001','10001','11111','10001','10001','10001'],'D':['11110','10001','10001','10001','10001','10001','11110'],
' ':['00000']*7}
text='CARD TEST' if len(sys.argv)>2 and sys.argv[2]=='embed-test' else 'PROOF QUEST'
scale=4;start=(w-(len(text)*6-1)*scale)//2
for i,letter in enumerate(text):
    for y,row in enumerate(font[letter]):
        for x,v in enumerate(row):
            if v=='1':rect(start+(i*6+x)*scale,32+y*scale,scale,scale,'edc779')
def chunk(kind,data):return struct.pack('!I',len(data))+kind+data+struct.pack('!I',zlib.crc32(kind+data)&0xffffffff)
raw=b''.join(b'\0'+pixels[y*w*3:(y+1)*w*3] for y in range(h))
png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',w,h,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b'')
Path(sys.argv[1]).write_bytes(png)
