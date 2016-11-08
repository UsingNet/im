var domain = 'usingnet.net';

var config = {
  'host': `//im.${domain}`,
  'socket': `//socket.${domain}/`,
  'start': `//im.${domain}/v2/client/start`,
  'read': `//im.${domain}/v2/client/read`,
  'token': `//im.${domain}/v2/client/info`,
  'send': `//im.${domain}/v2/client/send`,
  'lm': `//im.${domain}/v2/client/lm`,
  'evaluate': `//im.${domain}/v2/client/evaluate`,
  'upload': `//im.${domain}/v2/upload`
}

export default config;
