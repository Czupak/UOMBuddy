function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function getElementsByXPath(xpath, parent) {
  let results = [];
  let query = document.evaluate(xpath, parent || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  for (let i = 0, length = query.snapshotLength; i < length; ++i) {
      results.push(query.snapshotItem(i));
  }
  return results;
}

function parseWeight(weight) {
    regexp_weight = /([0-9, ]*)kg/;
    reg_res = weight.match(regexp_weight);
    if (!reg_res) {
        return '-no-weight-';
    }
    let parsed_weight = reg_res[1].replace(',', '.').replace(' ', '');
    return parsed_weight;
}

function parsePrice(price, elem) {
    price = price.split(/(\s+)/);
    price = price[elem].replace(',', '.');
    return price;
}

function parser1(weight, price) {
    console.log(`PRE: ${weight} & ${price}`);
    let parsed_weight = parseWeight(weight);
    let parsed_price = parsePrice(price, 0);
    console.log(`POST: ${parsed_weight} & ${parsed_price}`);
    let ppw = parsed_price / parsed_weight;
    if (ppw) {
        ppw = `${ppw.toFixed(2)}/kg`;
    } else {
        ppw = "-";
    }
    console.log(`PricePerWeight: ${ppw}`);
    return ppw;
}

function parser2(weight, price) {
    console.log(`PRE: ${weight} & ${price}`);
    let parsed_weight = parseWeight(weight);
    let parsed_price = parsePrice(price, 2);
    console.log(`POST: ${parsed_weight} & ${parsed_price}`);
    let ppw = parsed_price / parsed_weight;
    if (ppw) {
        ppw = `${ppw.toFixed(2)}/kg`;
    } else {
        ppw = "-";
    }
    console.log(ppw);
    return ppw;
}

function getPricePerKg(title, price, parser) {
    if(parser == 2) {
        return parser2(title, price);
    } else {
        return parser1(title, price);
    }
}

function scanPage(page_config) {
    const elements = getElementsByXPath(page_config['items_xpath']);
    elements.forEach((element) => {
      let title = getElementsByXPath(page_config['weight_xpath'], element)[0];
      let price = getElementsByXPath(page_config['price_xpath'], element)[0];
      if (price && title) {
          let my_p = getElementsByXPath(`${page_config['price_xpath']}/p`, element)[0];
          if (my_p) {
          } else {
            price.innerHTML = `${price.innerHTML}<p style='color: ${page_config['color']}'>${getPricePerKg(title.innerText, price.innerText, page_config['parser'])}</p>`;
          }
        }
    });
}

const config = {
    'botland.com.pl': {
        'items_xpath': '//*[@id="js-product-list"]/div[1]/section/div/div[2]/div',
        'price_xpath': 'div[2]/form/div/div/span[3]',
        'weight_xpath': 'div[1]/p/a',
        'color': 'red',
        'parser': 1
    },
    'www.123-3d.nl': {
        'items_xpath': '//*[@id="filter-loader"]/div[2]/div/div',
        'price_xpath': 'table/tbody/tr[5]/td[2]/span[1]',
        'weight_xpath': "table/tbody/tr[3]/td[2]/fieldset[2]/table/tbody/tr/td[contains(text(),'Gewicht:')]/following-sibling::*",
        'color': 'green',
        'parser': 2
    }
};

const host = window.location.hostname;
console.log(host);
if(config.hasOwnProperty(host)) {
    console.log('Found config for host.');
    var myOldUrl = '';
    setInterval(function(){
        if (window.location.href != myOldUrl) {
            scanPage(config[host]);
            myOldUrl = window.location.href;
        };
    }, 1000);
}