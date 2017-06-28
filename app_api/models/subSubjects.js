var mongoose = require('mongoose');

var videoSchema = new mongoose.Schema({
  name: String,
  link: String
});

var subSubjectSchema = new mongoose.Schema({
  name: String,
  videos:[
      {type: Schema.Types.ObjectId, ref: 'Video'}
  ]

});

mongoose.model('Video', videoSchema);
mongoose.model('SubSubject', subSubjectSchema);


subSubjects
{
    name:'',
	videos:[{
		type:'', // tutorial, exercise solution
		name:'',
		link:'',
		views:'',
		likes:'',
		dislikes:'',
		
	},
	{},
	{}
	],
	exercises:
	[
		Id:'1',
		Id:'2',
		Id:'3'
	],
	subjectId:''
    
}