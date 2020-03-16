import "jquery";

// 日時操作
import {format} from 'date-fns';
import ja from 'date-fns/locale/ja';

// IEのFormData対策用
import 'formdata-polyfill'

// ------------------------
//  状態管理
// ------------------------
var state ={
      items: [],    // アイテム
      mode: [],     // アイテムのモード(表示/編集)
      name: '',     // 投稿 - 名前
      comment: '',  // 投稿 - コメント       
      status: 'ここに「Ajax」に関するメッセージが表示されます。'     
};

// ------------------------
//  イベント
// ------------------------

// データの変更(name)
window.handleNameChange = function(event){
  state.name = event.target.value;
  event.preventDefault();   
}

// データの変更(comment)
window.handleCommentChange = function(event){
  state.comment = event.target.value;
  event.preventDefault();   
}

// 表示モード/編集モードの切り替え
window.handleModeChange = function(index, event){
  var html = '';
  
  state.mode[index] = !state.mode[index];  
  if (state.mode[index])
    html += htmlCardEdit(index);
  else
    html += htmlCardShow(index);
  
  // 一部のみ更新
  $("#card" + state.items[index].id).html(html);  
  
  event.preventDefault(); 
}

// データの登録
window.handleInsert = function(event){
  
  if (state.name && state.comment){
    
    // Ajax
    run_ajax("POST",
             "http://localhost:3000/jquery_crud_data/" ,
             {datum: {name: state.name, comment: state.comment}}
            );
                                              
    state.name = '';
    state.comment = '';
  }  
  event.preventDefault();   
}

// データの更新
window.handleUpdate = function(index, event){
  var form_data = new FormData(event.target);
  
  var txt_name = form_data.get('txt_name');
  var txt_comment = form_data.get('txt_comment');
      
  if (
      (txt_name && txt_comment) &&
      (!(state.items[index].name == txt_name && 
         state.items[index].comment == txt_comment))
     ){      
    
    // 値の設定
    state.items[index].name  = txt_name;
    state.items[index].comment  = txt_comment;
    state.items[index].updated_at  = new Date();
    
    // 表示モードに変更する
    state.mode[index] = !state.mode[index]; 
    
    // Ajax    
    run_ajax("PUT",
             "http://localhost:3000/jquery_crud_data/"  + state.items[index].id ,
             {datum: {name: txt_name, comment: txt_comment}}
            );
  }  
  
  // 一部のみ更新
  $("#card" + state.items[index].id).html(htmlCardShow(index));   
  event.preventDefault(); 
}

// データの削除
window.handleDelete = function(index, event){
  
  // Ajax
  run_ajax("DELETE",
           "http://localhost:3000/jquery_crud_data/"  + state.items[index].id ,
            {}
           );

  state.items.splice(index, 1);
  state.mode.splice(index, 1);
    
  // すべて再描画
  $("#root").html(render());
                     
  event.preventDefault(); 
}

// ------------------------
//  関数
// ------------------------

// サニタイズ
function htmlspecialchars(str){
  
 return (str + '').replace(/&/g,'&amp;')
                  .replace(/"/g,'&quot;')
                  .replace(/'/g,'&#039;')
                  .replace(/</g,'&lt;')
                  .replace(/>/g,'&gt;'); 
}

// Ajax
function run_ajax(method, url, data){
  
  $.ajax({
      url: url,
      method: method,
      data: JSON.stringify(data),
      headers:{
        // JSON
        'Content-Type': 'application/json',
        // CSRFトークン
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
     }
      
  }).done(function(data, status, xhr) {
      
      // 新規登録時のみIDなどが返却される
      if(data.id){
        
        // 失敗
        if(data.id == "error"){
          
          // エラー制御は行っていないので各自で。
          
        // 成功  
        }else{
          // 先頭にアイテムを追加する 
          state.items.unshift({id: data.id,
                              name: data.name,
                              comment: data.comment,
                              updated_at: data.updated_at}
                             );    
          state.mode.unshift(false);          
    
          // すべて再描画
          $("#root").html(render());                
        }
      // 更新/削除
      }else{
        // エラー制御は行っていないので各自で。
      }  
      
      $("#status").html(htmlspecialchars("サーバーからのメッセージ(" + 
                                         formatConversion(new Date())  + ") ：" + data.registration
                                         ));      
      
  }).fail(function(xhr, status, error) {
       $("#status").html(htmlspecialchars(error))
  });  
}

// 日付操作
function formatConversion(updated_at) {
  
  return format(new Date(Date.parse(updated_at)), 'yyyy年MM月dd日(iiiii) HH:mm:ss', {locale: ja});
}
    
// 表示モード    
function htmlCardShow(index){

  return  '  <div class="card-header">' +
          '    '+ htmlspecialchars(state.items[index].name) +' <br />' + formatConversion(state.items[index].updated_at) +
          '  </div>' +
          '  <div class="card-body">' +
          '    ' + htmlspecialchars(state.items[index].comment) +
          '    <br>' +
          '    <br>' +
          '    <form>' +
          '      <div style="text-align:right;">' +
          '        <input type="submit" value="編集" class="btn btn-primary" onclick="handleModeChange('+ index +', window.event);" />&nbsp;' +
          '        <input type="submit" value="削除" class="btn btn-danger" onclick="handleDelete('+ index +', window.event);" />&nbsp;&nbsp;' +
          '      </div>' +
          '    </form>' +
          '  </div>';
}

// 編集モード
function htmlCardEdit(index){

  return  '  <form onsubmit="handleUpdate('+ index +', window.event);">' +
          '    <div class="card-header">' +
          '      <input type="text" value="'+ htmlspecialchars(state.items[index].name) +'" name="txt_name" class="form-control" />' +
          '    </div>' +
          '    <div class="card-body">' +
          '      <textarea name="txt_comment" class="form-control" rows="5" >' + htmlspecialchars(state.items[index].comment) +'</textarea>' +
          '    </div>' +
          '    <div style="text-align:right;">' +
          '      <input type="submit" value="キャンセル" class="btn btn-secondary" onclick="handleModeChange('+ index +', window.event);" />&nbsp;' +
          '      <input type="submit" value="更新" class="btn btn-primary" />&nbsp;&nbsp;' +
          '    </div>' +
          '    <p></p>' +
          '  </form>';        
}

// レンダー
function render(){
  
  var html = '';
  
  html =  '<p></p>' +
          '<div class="fixed-bottom bg-dark text-white" style="opacity: 0.55">' +
          '  <span>&nbsp;</span>' +
          '  <span id="status">'+ htmlspecialchars(state.status) +'</span>' +
          '</div>' +
          '<h3>投稿</h3>' +
          '<p></p>' +
          '<form onsubmit="handleInsert(window.event);">' +
          '  <input type="text" class="form-control" placeholder="名前" onchange="handleNameChange(window.event);" />' +
          '  <textarea class="form-control" rows="5" placeholder="コメントを入力します。" onchange="handleCommentChange(window.event);" />' +
          '  <input type="submit" value="登録" class="btn btn-primary" />' +
          '</form>' +        
          '<p></p>' +  
          '<h3>一覧</h3>' +
          '<p></p>' + 
    '<div class="card-columns">';
      
      // 各カード    
      for(var i=0; i<state.items.length;i++){
        
         html += '<div class="card" id="card'+ state.items[i].id +'">';
         
           if (state.mode[i])
             html += htmlCardEdit(i);
           else                       
             html += htmlCardShow(i);
             
         html += '</div>';   
      }  
  
  html += '</div>';
  
  return html; 
}

// ------------------------
//  メイン
// ------------------------
$(function() {
  
  // JSONデータの取得
  $.ajax({
      url: "http://localhost:3000/jquery_crud_data/index.json",
      method: "GET",
  }).done(function(data, status, xhr) {
      
      // リストデータ
      state.items = data;
      
      // モードの初期化(全て表示モード)
      for(var i=0;i<data.length;i++){
        state.mode[i] = false;
      }
            
      // レンダー  
      $("#root").html(render());
      
  }).fail(function(xhr, status, error) {
      alert(error)
  });
  
});
