<?php


class Hero
{
    var $name;
    var $hid;
    var $attributes;
    var $displayName;

    
    function icon()
    {
        $icon = $this->attributes['ICON'];
        $icon = str_replace('.tga', '.png', $icon);
        return $icon;
    }
    
    function image()
    {
        $file = sprintf('images/heroes/%s/%s', $this->shortName(), $this->icon());
        return $file;
    }
}

class Item
{
    var $id;
    var $name;
    var $icon;
    var $attributes;
    var $displayName;
	
    function isRecipe()
    {
        return isset($this->attributes['COMPONENTS']);
    }
    
    function isConsumable()
    {
        if(isset($item->attributes['CATEGORY']))
        {
            if($item->attributes['CATEGORY'] == 'consumable'
                || $item->attributes['CATEGORY'] == 'ward')
            {
                return true;
            }
        }
        return false;
    }
}

$string_tables = new SimpleXMLElement(file_get_contents('http://xml.heroesofnewerth.com/xml_requester.php?f=stringtable&opt=trans&trans[]=en'));
$strings = array();
foreach($string_tables->stringtables->trans->stat as $statXML)
{
   $strings[(string)$statXML->attributes()->name] = (string)$statXML;
} 

$hero_info = new SimpleXMLElement(file_get_contents('http://xml.heroesofnewerth.com/xml_requester.php?f=hero_info'));
$heros = array();
foreach($hero_info->heroes->hero as $heroXML)
{
    $hero = new Hero();
    $hero->hid = (int)$heroXML->attributes()->hid;
    foreach($heroXML->stat as $stat)
    {
        switch((string)$stat->attributes()->name)
        {
            case 'cli_name':
                $hero->name = (string)$stat;
                break;
            case 'attributes':
                $hero->attributes = unserialize((string)$stat);
                break;
        }		
    }
    if ($hero->name == 'Hero_MuteCleric') continue;
	$hero->displayName = $strings[$hero->name . '_name'];	
    $heroes[] = $hero;
}

$item_info = new SimpleXMLElement(file_get_contents('http://xml.heroesofnewerth.com/xml_requester.php?f=item_info'));
$items = array();
foreach($item_info->items->item as $itemXML)
{
    $item = new Item();
    $item->id = (int)$itemXML->attributes()->id;
    foreach($itemXML->stat as $stat)
    {
        switch((string)$stat->attributes()->name)
        {
            case 'cli_name':
                $item->name = (string)$stat;
                break;
            case 'icon':
                $item->icon = (string)$stat;
                break;
            case 'attributes':
                $item->attributes = unserialize((string)$stat);
                break;
        }
    }
    
    if($item->attributes === false)
    {
        continue;
    }
    if($item->isConsumable())
    {
        continue;
    }
    $item->displayName = $strings[$item->name . '_name'];
    $items[] = $item;
}

$q = isset($_GET['q']) ? $_GET['q'] : null;
switch($q)
{
    case 'hero_info':
        header('Content-type: application/json');
        echo json_encode($heroes);
        break;
    case 'item_info':
        header('Content-type: application/json');
        echo json_encode($items);
        break;
    default:
        echo '<p><a href="?q=hero_info">hero_info</a></p>';
        echo '<p><a href="?q=item_info">item_info</a></p>';
}