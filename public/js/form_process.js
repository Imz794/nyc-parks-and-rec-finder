import { parkList, recList, allList } from 'parks_rec.js'
const listForm = document.getElementById('listform');

let page = 1;

if(listForm){
    const parks = document.getElementById('parklist');
    const recs = document.getElementById('reclist');
    const list = document.getElementById('list');
    const errors = document.getElementById('error');

    listForm.addEventListener('change', (event) => {
        event.preventDefault();

        let result;
        try{
            errors.hidden = true;
            errors.classList.remove('error');
            errors.textContent = "";

            if(parks.checked && !recs.checked){
                result = parkList(page);
            }
            else if(recs.checked && !parks.checked){
                result = recList(page);
            }
            else{
                result = allList(page);
            }

            const p = document.createElement('p');
            p.textContent = result;

            list.innerHTML = '';
            list.appendChild(p);
        }

        catch(e){
            errors.hidden = false;
            errors.classList.add('error');
            errors.textContent = e.message;
        }

    });
}

const backPage = document.getElementById('back');

if(backPage){
    const parks = document.getElementById('parklist');
    const recs = document.getElementById('reclist');
    const list = document.getElementById('list');
    const errors = document.getElementById('error');

    backPage.addEventListener('click', (event) => {
        event.preventDefault();

        let result;
        try{
            errors.hidden = true;
            errors.classList.remove('error');
            errors.textContent = "";

            if(page >= 1){
                page--;
            }
            if(parks.checked && !recs.checked){
                result = parkList(page);
            }
            else if(recs.checked && !parks.checked){
                result = recList(page);
            }
            else{
                result = allList(page);
            }

            const p = document.createElement('p');
            p.textContent = result;

            list.innerHTML = '';
            list.appendChild(p);
        }

        catch(e){
            errors.hidden = false;
            errors.classList.add('error');
            errors.textContent = e.message;
        }

    });
}

const nextPage = document.getElementById('next');

if(nextPage){
    const parks = document.getElementById('parklist');
    const recs = document.getElementById('reclist');
    const list = document.getElementById('list');
    const errors = document.getElementById('error');

    nextPage.addEventListener('click', (event) => {
        event.preventDefault();

        let result;
        try{
            errors.hidden = true;
            errors.classList.remove('error');
            errors.textContent = "";

            page++;

            if(parks.checked && !recs.checked){
                result = parkList(page);
            }
            else if(recs.checked && !parks.checked){
                result = recList(page);
            }
            else{
                result = allList(page);
            }

            const p = document.createElement('p');
            p.textContent = result;

            list.innerHTML = '';
            list.appendChild(p);
        }

        catch(e){
            errors.hidden = false;
            errors.classList.add('error');
            errors.textContent = e.message;
        }
    });
}