addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  //Check whether the request method is GET
  if (request.method === 'GET') {
    return responseHandler(request);
  } else {
    return new Response('Error!', { status: 405 });
  }
}

async function responseHandler(request) {
  let cookies = request.headers.get('Cookie');

  const responseJSON = await fetch('https://cfw-takehome.developers.workers.dev/api/variants')
    .then((response) => {
      return response.json();
    }
    )

  const variantUrls = responseJSON.variants;

  //Get random number for selecting a URL
  let randomInt = Math.random() < 0.5 ? 0 : 1;

  //Check if cookie is present and serve the appropriate URL
  if (cookies != null) {
    let cookiesList = cookies.split(';')
    cookiesList.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim()
      if (cookieName === 'siteCookie') {
        randomInt = cookie.split('=')[1];
      }
    })
  }

  let selectedUrl = variantUrls[randomInt];

  //Generate a cookie
  const siteCookie = `siteCookie=${randomInt}; Expires=Wed, 30 Apr 2030 00:00:00 GMT; Path='/';`;

  const outputHTML = await fetch(selectedUrl)
    .then((response) => {
      if (response.status == 200) {
        return response;
      } else new Response('Error!', { status: 500 });
    })

  let response = outputHTML;
  response = titleEditor.transform(outputHTML);
  response = headingEditor.transform(response);
  response = descEditor.transform(response);
  response = linkEditor.transform(response);
  response.headers.set('Set-Cookie', siteCookie);
  return response;
}


class TitleEditor {
  element(element) {
    console.log(element);
  }
}

class HeaderEditor {
  element(element) {
    if (element) {
      element.prepend("This is");
      element.append(" of the site");
    }
  }
}

class DescEditor {
  element(element) {
    if (element) {
      element.setInnerContent("Knowledge is power! Want to know more?")
    }
  }
}

class LinkEditor {
  element(element) {
    element.setAttribute('href', 'https://www.linkedin.com/in/greeshma-avadhootha/');
    element.setInnerContent('Navigate');

  }
}
//Editors for customising the HTML
const linkEditor = new HTMLRewriter().on('a#url', new LinkEditor('href'));
const headingEditor = new HTMLRewriter().on('h1#title', new HeaderEditor());
const descEditor = new HTMLRewriter().on('p#description', new DescEditor());
const titleEditor = new HTMLRewriter().on('title', new TitleEditor());
