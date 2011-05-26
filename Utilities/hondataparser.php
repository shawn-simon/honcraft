<?php

class HoncraftAPI
{
    function run()
    {
        $q = isset($_GET['q']) ? $_GET['q'] : null;
        switch($q)
        {
            case 'hero_info':
                $this->heroInfo();
                break;
            case 'item_info':
                $this->itemInfo();
                break;
            default:
                $this->help();
                break;
        }
    }
    
    function help()
    {
        echo '<ul>';
        echo '<li><a href="?q=hero_info">hero_info</a></li>';
        echo '<li><a href="?q=item_info">item_info</a></li>';
        echo '</ul>';
    }
    
    function getResourcesDir()
    {
        $resourcesDir = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'resources';
        return $resourcesDir;
    }
    
    function heroInfo()
    {
        if(file_exists('hero_info.json'))
        {
            $this->output(file_get_contents('hero_info.json'));
            return;
        }
        $entities = glob($this->getResourcesDir() . DIRECTORY_SEPARATOR . 'heroes/*/hero.entity');
        $heroes = array();
        foreach($entities as $entity)
        {
            $hero = array();
            $doc = new DOMDocument('1.0', 'UTF-8');
            $doc->loadXML(file_get_contents($entity));
            $heroXML = $doc->documentElement;
            foreach($heroXML->attributes as $attributeNode)
            {
                $hero[$attributeNode->nodeName] = $attributeNode->nodeValue;
            }
            $heroes[] = $hero;
        }
        $content = json_encode($heroes);
        $fp = fopen('hero_info.json', 'w');
        fwrite($fp, $content);
        fclose($fp);
        $this->output($content);
    }
    
    function itemInfo()
    {
        if(file_exists('item_info.json'))
        {
            $this->output(file_get_contents('item_info.json'));
            return;
        }
        $entities = glob($this->getResourcesDir() . DIRECTORY_SEPARATOR . 'items/basic/*/item.entity');
        $items = array();
        foreach($entities as $entity)
        {
            $item = array();
            $item['itemtype'] = 'basic';
            $doc = new DOMDocument('1.0', 'UTF-8');
            $doc->loadXML(file_get_contents($entity));
            $itemXML = $doc->documentElement;
            foreach($itemXML->attributes as $attributeNode)
            {
                $item[$attributeNode->nodeName] = $attributeNode->nodeValue;
            }
            $items[] = $item;
        }
        $entities = glob($this->getResourcesDir() . DIRECTORY_SEPARATOR . 'items/recipes/*/item.entity');
        foreach($entities as $entity)
        {
            $item = array();
            $item['itemtype'] = 'recipe';
            $doc = new DOMDocument('1.0', 'UTF-8');
            $doc->loadXML(file_get_contents($entity));
            $itemXML = $doc->documentElement;
            foreach($itemXML->attributes as $attributeNode)
            {
                $item[$attributeNode->nodeName] = $attributeNode->nodeValue;
            }
            $items[] = $item;
        }
        $content = json_encode($items);
        $fp = fopen('item_info.json', 'w');
        fwrite($fp, $content);
        fclose($fp);
        $this->output($content);
    }
    
    function output($str)
    {
        header('Content-type: application/json');
        echo $str;
    }
}

$api = new HoncraftAPI();
$api->run();