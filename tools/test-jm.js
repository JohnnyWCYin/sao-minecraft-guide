// Self-test for site/jm.js + site/nbt.js against DelayedCode's real JourneyMap 6 file. Run: node tools/test-jm.js
global.NBT = require('../site/nbt.js');
const JM = require('../site/jm.js'), fs = require('fs'), assert = require('assert');
const sample = fs.readFileSync(__dirname + '/../raw/dc/WaypointDataWorking.dat');
assert.ok(Buffer.from(NBT.write(NBT.read(sample))).equals(sample), 'NBT round-trip is byte-identical');
assert.equal(JM.importFile(sample, 'WaypointData.dat').length, 9);
const grp = [{ name: '攻略本・我的標記', color: '#ffe066', points: [{ name: '起始之城', x: 1700, z: 4300 }, { name: '負數', x: -131.4, y: 83, z: -93 }] }];
const back = JM.importFile(JM.exportDat(grp), 'x.dat');
assert.equal(back.length, 2); assert.equal(back[0].group, '攻略本・我的標記'); assert.equal(back[1].x, -131); assert.equal(back[0].color, '#ffe066');
const merged = JM.exportDat(grp, sample);
assert.equal(JM.importFile(merged, 'x.dat').length, 11, 'keeps the player\'s own waypoints');
assert.equal(JM.importFile(JM.exportDat(grp, merged), 'x.dat').length, 11, 'no duplicates on re-export');
assert.equal(JM.importFile(Buffer.from('{"name":"Home","x":1,"y":64,"z":2,"r":255,"g":0,"b":0}'), 'Home.json')[0].color, '#ff0000');
const z = JM.zip('WaypointData.dat', new Uint8Array([1, 2, 3]));
assert.equal(new DataView(z.buffer).getUint32(0, true), 0x04034b50); assert.equal(z.length, 30 + 16 + 3 + 46 + 16 + 22);
console.log('jm tests passed');

// Xaero's Minimap
const xa = JM.exportXaero([{ name: '攻略本', color: '#ff5555', points: [{ name: 'Boss: Pumba', x: 1859, z: 3606 }, { name: '起始之城', x: 1700, y: 70, z: 4300 }] }]);
assert.ok(xa.startsWith('sets:gui.xaero_default\n#\n#waypoint:'));
assert.ok(xa.includes('waypoint:Boss§§ Pumba:B:1859:~:3606:12:false:0:gui.xaero_default:false:0:0:false'));
const xb = JM.importXaero(xa);
assert.equal(xb.length, 2); assert.equal(xb[0].name, 'Boss: Pumba'); assert.equal(xb[0].y, null); assert.equal(xb[1].y, 70); assert.equal(xb[1].color, '#ff5555');
const own = 'sets:gui.xaero_default\n#\nwaypoint:Home:H:10:64:-20:2:false:0:gui.xaero_default:false:0:0:false\n';
const mx = JM.exportXaero([{ name: 'x', color: '#fff', points: [{ name: 'Home', x: 10, z: -20 }, { name: 'New', x: 1, z: 2 }] }], own);
assert.equal(JM.importXaero(mx).length, 2, 'keeps own waypoints, skips duplicates');
assert.equal(JM.importXaero('xaero-waypoint:Shop:S:5:~:6:3:false:0:Internal-overworld-waypoints')[0].x, 5);
console.log('xaero tests passed');
