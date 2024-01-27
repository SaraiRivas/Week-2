async function fetchUsers() {
    const res = await fetch
    ('http://api.weatherapi.com/v1/current.json?key=3ad31ff726014559a2a20337242601&q=el salvador');

    const data = await res.json();

    console.log(data);


}
fetchUsers();

