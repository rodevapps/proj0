import React, { useState, useEffect } from 'react';
import './App.css';

const DOMPurify = require('dompurify');

function App() {
  const [error, setError] = useState(null);
  const [emails, setEmails] = useState([]);
  const [sortState, setSortState] = useState(null);
  const [removedElement, setRemovedElement] = useState(null);

  useEffect(() => {
    const init = [{title: 'A', body: "<span onClick=\"alert('Hello!')\"><strong>Text</strong></span>&nbsp;<script>alert('Hello!');</script>", date: 'C'}, {title: 'B', body: 'C', date: 'D'}, {title: 'C', body: 'D', date: 'E'}];

    const ls = localStorage.getItem('emails');

    if (ls) {
      console.log('Readed from local storage');
      setEmails(JSON.parse(ls));
    } else {
      console.log('Readed from initial values');
      setEmails(init);
    }
  }, []);

  function handleEmailRemove(e, k) {
    e.preventDefault();

    setRemovedElement(k);

    const id = document.getElementById('delete-dialog');

    id.showModal();
  }

  function handleEmailRemove2(e) {
    e.preventDefault();

    let new_array = JSON.parse(JSON.stringify(emails));

    new_array.splice(removedElement, 1);

    setEmails(new_array);
    localStorage.setItem('emails', JSON.stringify(new_array));

    const id = document.getElementById('delete-dialog');

    id.close();
  }

  function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }
  
  function formatDate(date) {
    return (
      [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
      ].join('-') +
      ' ' +
      [
        padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
        padTo2Digits(date.getSeconds()),
      ].join(':')
    );
  }

  function handleEmailCreate(e) {
    e.preventDefault();

    const id = document.getElementById('create-dialog');

    id.showModal();
  }

  function handleEmailCreate2(e) {
    e.preventDefault();

    const title = document.getElementsByName('title')[0].value;
    const body = document.getElementsByName('body')[0].value;

    if (title.length < 3 || title.length > 250) {
      setError("Title should be > 2 charcters <= 250 characters!!")
    } else {
      let new_array = JSON.parse(JSON.stringify(emails));

      new_array.push({title: title, body: body, date: formatDate(new Date())})

      setEmails(new_array);
      localStorage.setItem('emails', JSON.stringify(new_array));

      const id = document.getElementById('create-dialog');

      id.close();
    }
  }

  function handleEmailEdit(e, k) {
    e.preventDefault();

    document.getElementsByName('title2')[0].value = emails[k].title;
    document.getElementsByName('body2')[0].value = emails[k].body;
    document.getElementsByName('id2')[0].value = k;

    const id = document.getElementById('edit-dialog');

    id.showModal();
  }

  function handleEmailEdit2(e) {
    e.preventDefault();

    const title = document.getElementsByName('title2')[0].value;
    const body = document.getElementsByName('body2')[0].value;
    const id2 = document.getElementsByName('id2')[0].value;

    if (title.length < 3 || title.length > 250) {
      setError("Title should be > 2 charcters <= 250 characters!!")
    } else {
      if (id2 !== null && id2 !== undefined) {
        let new_array = JSON.parse(JSON.stringify(emails));
  
        new_array[id2] = {title: title, body: body, date: formatDate(new Date())}
  
        setEmails(new_array);
        localStorage.setItem('emails', JSON.stringify(new_array));
      } else {
        alert('Email id not defined!');
      }

      const id = document.getElementById('edit-dialog');

      id.close();
    }
  }

  function handleSort(e, direction, element) {
    e.preventDefault();

    let new_array = JSON.parse(JSON.stringify(emails));

    let d;

    if (direction === "asc")
      d = 1;
    else
      d = -1;

    new_array.sort((a, b) => {
      if (a[element] < b[element])
        return -1 * d

      if (a[element] > b[element])
        return 1 * d

      return 0
    });

    setEmails(new_array);
    localStorage.setItem('emails', JSON.stringify(new_array));
    setSortState({direction: direction, element: element});
  }

  function handleEmailShow(e, k) {
    e.preventDefault();

    const id = document.getElementById('show-dialog');

    const old = document.getElementById("email");
    old?.parentNode.removeChild(old);

    id.insertAdjacentHTML('afterbegin', `<div id="email"><p><strong>${emails[k].title}</strong></p><p>${DOMPurify.sanitize(emails[k].body)}</p><p>${emails[k].date}</p></div>`);

    id.showModal();
  }

  function htmlToText(html){
    var tempDivElement = document.createElement("div");

    tempDivElement.innerHTML = html.replace(/<script[^>]*>[^<]*<\/script>/gi, "").replace(/&[^; ]+;/gi, "");

    return tempDivElement.textContent || tempDivElement.innerText || "";
  }

  return (
    <div className="App">
      <div style={{width: '100%', textAlign: 'right', paddingBottom: '10px'}}>
        <div className="button" onClick={(e) => handleEmailCreate(e)}>
          Dodaj
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Tytuł 
              <span className={"sort-by-asc" + ((sortState !== null && sortState.element === "title" && sortState.direction === "asc") ? " shidden" : "")} onClick={(e) => handleSort(e, "asc", "title")}></span>
              <span className={"sort-by-desc" + ((sortState !== null && sortState.element === "title" && sortState.direction === "desc") ? " shidden" : "")} onClick={(e) => handleSort(e, "desc", "title")}></span>
            </th>
            <th>Treść wiadomości</th>
            <th>Data dodania
              <span className={"sort-by-asc" + ((sortState !== null && sortState.element === "date" && sortState.direction === "asc") ? " shidden" : "")} onClick={(e) => handleSort(e, "asc", "date")}></span>
              <span className={"sort-by-desc" + ((sortState !== null && sortState.element === "date" && sortState.direction === "desc") ? " shidden" : "")} onClick={(e) => handleSort(e, "desc", "date")}></span>
            </th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {
            emails.map((v, k) => 
            <tr key={k}>
              <td>{v.title}</td>
              <td>{htmlToText(v.body, {}).length > 30 ? htmlToText(v.body, {}).substring(0, 30) + "..." : htmlToText(v.body, {})}</td>
              <td>{v.date}</td>
              <td title="Show" className="show" onClick={(e) => handleEmailShow(e, k)}></td>
              <td title="Edit" className="edit" onClick={(e) => handleEmailEdit(e, k)}></td>
              <td title="Remove" className="remove" onClick={(e) => handleEmailRemove(e, k)}></td>
            </tr>
            )
          }
        </tbody>
        <tfoot>
          <tr>
          <th>Tytuł 
              <span className={"sort-by-asc" + ((sortState !== null && sortState.element === "title" && sortState.direction === "asc") ? " shidden" : "")} onClick={(e) => handleSort(e, "asc", "title")}></span>
              <span className={"sort-by-desc" + ((sortState !== null && sortState.element === "title" && sortState.direction === "desc") ? " shidden" : "")} onClick={(e) => handleSort(e, "desc", "title")}></span>
            </th>
            <th>Treść wiadomości</th>
            <th>Data dodania
              <span className={"sort-by-asc" + ((sortState !== null && sortState.element === "date" && sortState.direction === "asc") ? " shidden" : "")} onClick={(e) => handleSort(e, "asc", "date")}></span>
              <span className={"sort-by-desc" + ((sortState !== null && sortState.element === "date" && sortState.direction === "desc") ? " shidden" : "")} onClick={(e) => handleSort(e, "desc", "date")}></span>
            </th>
            <th></th>
            <th></th>
            <th></th>
          </tr>
        </tfoot>
      </table>

      <dialog id="create-dialog">
        <p><strong>Create new email</strong></p>
        <div>
          <label>Title</label><br/>
          {error ? <><small style={{color: 'red'}}>{error}</small><br/></> : ""}
          <input type="text" name="title" /><br/>
        </div>
        <div>
         <label>Body</label><br/>
         <textarea name="body"></textarea><br/>
        </div>
        <form style={{display: 'inline'}} method="dialog"><button>Close</button></form>&nbsp;<button onClick={(e) => handleEmailCreate2(e)}>Create</button>
      </dialog>

      <dialog id="edit-dialog">
        <p><strong>Edit email</strong></p>
        <input type="hidden" name="id2" />
        <div>
          <label>Title</label><br/>
          {error ? <><small style={{color: 'red'}}>{error}</small><br/></> : ""}
          <input type="text" name="title2" /><br/>
        </div>
        <div>
         <label>Body</label><br/>
         <textarea name="body2"></textarea><br/>
        </div>
        <form style={{display: 'inline'}} method="dialog"><button>Close</button></form>&nbsp;<button onClick={(e) => handleEmailEdit2(e)}>Save</button>
      </dialog>

      <dialog id="delete-dialog">
        <p style={{color: 'red'}}><strong>Are you sure?</strong></p>
        <form style={{display: 'inline'}} method="dialog"><button>Close</button></form>&nbsp;<button onClick={(e) => handleEmailRemove2(e)}>OK</button>
      </dialog>

      <dialog id="show-dialog">
        <form method="dialog"><button>Close</button></form>
      </dialog>
    </div>
  );
}

export default App;