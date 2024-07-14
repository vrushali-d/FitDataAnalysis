import ora from "ora";
function heavyLogic(){
    let p = new Promise((resolve,reject)=>{
        setTimeout(()=>{
            for(let i=0;i<10000000000;++i){

            }
            resolve(true);
        },2000)
        
    });
    return p;
}
const spinner = ora('Processing...').start();
let p = heavyLogic();
p.then((result)=>{
    spinner.succeed("Done!");
    spinner.stop();
});
console.log('after heavy task...');