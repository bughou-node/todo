var nodemailer = require('nodemailer');
var Transport = nodemailer.createTransport();

var mailOptions = {
    from: 'sender@address',//发件人
    to: 'receiver@address',//收件人
    subject: 'hello',//主题
    //text,html必选一项
    text: 'hello world!',//text格式内容
    html: '<b>hello world!</b>'//html格式内容
};

Transport.sendmail(mailOptions, function(err, info) {
  if(err) {
    console.log(err);
  } else {
    console.log('Message sent:' + info.response);
  }
});
